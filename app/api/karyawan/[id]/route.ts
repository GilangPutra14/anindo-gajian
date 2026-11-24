import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Karyawan } from '@/models/karyawan';

// PUT: Update data karyawan berdasarkan ID
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const updated = await Karyawan.findByIdAndUpdate(
      id,
      {
        nip: body.nip,
        nama: body.nama,
        jabatan: body.jabatan,
        divisi: body.divisi,
        gajiPokok: Number(body.gajiPokok) || 0,
        status: body.status,
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: 'Data tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Data karyawan berhasil diperbarui', data: updated },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// DELETE: Hapus data karyawan berdasarkan ID
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const deleted = await Karyawan.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: 'Data tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Data karyawan berhasil dihapus' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
