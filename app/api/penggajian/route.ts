import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Penggajian } from '@/models/penggajian';
import { Karyawan } from '@/models/karyawan';
import { Kinerja } from '@/models/kinerja';

export async function GET() {
  try {
    await connectDB();
    const data = await Penggajian.find({})
      .populate('karyawanId', 'nip nama divisi jabatan')
      .sort({ periode: -1, createdAt: -1 });

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { karyawanId, periode, tunjangan, potongan, statusBayar } = await req.json();

    if (!karyawanId || !periode) {
      return NextResponse.json(
        { message: 'Karyawan dan periode gaji wajib dipilih' },
        { status: 400 }
      );
    }

    const cekGanda = await Penggajian.findOne({ karyawanId, periode });
    if (cekGanda) {
      return NextResponse.json(
        { message: 'Gaji karyawan ini pada periode tersebut sudah dibuat' },
        { status: 400 }
      );
    }

    const karyawan = await Karyawan.findById(karyawanId);
    if (!karyawan) {
      return NextResponse.json({ message: 'Karyawan tidak ditemukan' }, { status: 404 });
    }

    // Cek penilaian kinerja pada periode yang sama
    const dataKinerja = await Kinerja.findOne({ karyawanId, periode });
    const nilaiKinerja = dataKinerja ? dataKinerja.nilaiAkhir : 0;
    const predikatKinerja = dataKinerja ? dataKinerja.predikat : 'Belum Dinilai';

    // Hitung bonus kinerja otomatis
    let persenBonus = 0;
    if (predikatKinerja === 'Sangat Baik') persenBonus = 0.15;
    else if (predikatKinerja === 'Baik') persenBonus = 0.1;
    else if (predikatKinerja === 'Cukup') persenBonus = 0.05;

    const gajiPokok = Number(karyawan.gajiPokok) || 0;
    const bonusKinerja = Math.round(gajiPokok * persenBonus);
    const nomTunjangan = Number(tunjangan) || 0;
    const nomPotongan = Number(potongan) || 0;
    const totalGaji = gajiPokok + bonusKinerja + nomTunjangan - nomPotongan;

    const gajiBaru = await Penggajian.create({
      karyawanId,
      periode,
      gajiPokok,
      nilaiKinerja,
      predikatKinerja,
      bonusKinerja,
      tunjangan: nomTunjangan,
      potongan: nomPotongan,
      totalGaji,
      statusBayar: statusBayar || 'draft',
    });

    return NextResponse.json(
      { message: 'Data penggajian berhasil dibuat', data: gajiBaru },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
