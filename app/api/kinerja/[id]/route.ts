import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Kinerja } from '@/models/kinerja';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const deleted = await Kinerja.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: 'Data penilaian tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Data penilaian kinerja berhasil dihapus' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
