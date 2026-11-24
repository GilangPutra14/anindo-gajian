import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Kinerja } from '@/models/kinerja';
import '@/models/karyawan'; // Memastikan model Karyawan terdaftar untuk populate

function hitungPredikat(nilai: number): 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang' {
  if (nilai >= 85) return 'Sangat Baik';
  if (nilai >= 75) return 'Baik';
  if (nilai >= 60) return 'Cukup';
  return 'Kurang';
}

export async function GET() {
  try {
    await connectDB();
    const data = await Kinerja.find({})
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
    const body = await req.json();
    const {
      karyawanId,
      periode,
      kedisiplinan,
      kualitasKerja,
      produktivitas,
      kerjaSama,
      catatan,
    } = body;

    if (!karyawanId || !periode) {
      return NextResponse.json(
        { message: 'Karyawan dan periode penilaian wajib dipilih' },
        { status: 400 }
      );
    }

    const cekDuplikat = await Kinerja.findOne({ karyawanId, periode });
    if (cekDuplikat) {
      return NextResponse.json(
        { message: 'Karyawan ini sudah dinilai pada periode tersebut' },
        { status: 400 }
      );
    }

    const nDisiplin = Number(kedisiplinan) || 0;
    const nKualitas = Number(kualitasKerja) || 0;
    const nProduktif = Number(produktivitas) || 0;
    const nKerjaSama = Number(kerjaSama) || 0;

    // Rata-rata nilai akhir (dibulatkan 2 desimal)
    const nilaiAkhir = Number(
      ((nDisiplin + nKualitas + nProduktif + nKerjaSama) / 4).toFixed(2)
    );
    const predikat = hitungPredikat(nilaiAkhir);

    const dataBaru = await Kinerja.create({
      karyawanId,
      periode,
      kedisiplinan: nDisiplin,
      kualitasKerja: nKualitas,
      produktivitas: nProduktif,
      kerjaSama: nKerjaSama,
      nilaiAkhir,
      predikat,
      catatan,
    });

    return NextResponse.json(
      { message: 'Penilaian kinerja berhasil disimpan', data: dataBaru },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
