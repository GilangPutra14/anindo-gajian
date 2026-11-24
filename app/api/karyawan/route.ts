import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Karyawan } from '@/models/karyawan';

// GET: Ambil semua data karyawan
export async function GET() {
  try {
    await connectDB();
    const data = await Karyawan.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST: Tambah karyawan baru
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { nip, nama, jabatan, divisi, gajiPokok, status } = body;

    if (!nip || !nama || !jabatan || !divisi) {
      return NextResponse.json(
        { message: 'NIP, Nama, Jabatan, dan Divisi wajib diisi' },
        { status: 400 }
      );
    }

    const cekNip = await Karyawan.findOne({ nip });
    if (cekNip) {
      return NextResponse.json(
        { message: 'NIP sudah terdaftar pada karyawan lain' },
        { status: 400 }
      );
    }

    const karyawanBaru = await Karyawan.create({
      nip,
      nama,
      jabatan,
      divisi,
      gajiPokok: Number(gajiPokok) || 0,
      status: status || 'aktif',
    });

    return NextResponse.json(
      { message: 'Karyawan berhasil ditambahkan', data: karyawanBaru },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
