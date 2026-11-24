import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Penggajian } from '@/models/penggajian';

// PATCH: Ubah status bayar menjadi 'dibayar'
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const updated = await Penggajian.findByIdAndUpdate(
      id,
      { statusBayar: 'dibayar' },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: 'Data gaji tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Status gaji berhasil ditandai Dibayar', data: updated },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// DELETE: Hapus data penggajian
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const deleted = await Penggajian.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: 'Data gaji tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Data penggajian berhasil dihapus' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
