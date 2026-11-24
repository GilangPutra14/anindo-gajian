import mongoose, { Schema, model, models } from 'mongoose';

export interface IPenggajian {
  _id?: string;
  karyawanId: mongoose.Types.ObjectId;
  periode: string; // Contoh: "2026-11"
  gajiPokok: number;
  nilaiKinerja: number;
  predikatKinerja: string;
  bonusKinerja: number;
  tunjangan: number;
  potongan: number;
  totalGaji: number;
  statusBayar: 'draft' | 'dibayar';
  createdAt?: Date;
  updatedAt?: Date;
}

const PenggajianSchema = new Schema<IPenggajian>(
  {
    karyawanId: { type: Schema.Types.ObjectId, ref: 'Karyawan', required: true },
    periode: { type: String, required: true },
    gajiPokok: { type: Number, required: true, default: 0 },
    nilaiKinerja: { type: Number, default: 0 },
    predikatKinerja: { type: String, default: 'Belum Dinilai' },
    bonusKinerja: { type: Number, default: 0 },
    tunjangan: { type: Number, default: 0 },
    potongan: { type: Number, default: 0 },
    totalGaji: { type: Number, required: true, default: 0 },
    statusBayar: { type: String, enum: ['draft', 'dibayar'], default: 'draft' },
  },
  { timestamps: true }
);

// Mencegah gaji karyawan diproses ganda pada bulan/periode yang sama
PenggajianSchema.index({ karyawanId: 1, periode: 1 }, { unique: true });

export const Penggajian =
  models.Penggajian || model<IPenggajian>('Penggajian', PenggajianSchema);
