import mongoose, { Schema, model, models } from 'mongoose';

export interface IKinerja {
  _id?: string;
  karyawanId: mongoose.Types.ObjectId;
  periode: string; // Contoh: "2026-11" (Tahun-Bulan)
  kedisiplinan: number; // Skala 0 - 100
  kualitasKerja: number; // Skala 0 - 100
  produktivitas: number; // Skala 0 - 100
  kerjaSama: number; // Skala 0 - 100
  nilaiAkhir: number;
  predikat: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  catatan?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const KinerjaSchema = new Schema<IKinerja>(
  {
    karyawanId: { type: Schema.Types.ObjectId, ref: 'Karyawan', required: true },
    periode: { type: String, required: true },
    kedisiplinan: { type: Number, required: true, min: 0, max: 100 },
    kualitasKerja: { type: Number, required: true, min: 0, max: 100 },
    produktivitas: { type: Number, required: true, min: 0, max: 100 },
    kerjaSama: { type: Number, required: true, min: 0, max: 100 },
    nilaiAkhir: { type: Number, required: true },
    predikat: {
      type: String,
      enum: ['Sangat Baik', 'Baik', 'Cukup', 'Kurang'],
      required: true,
    },
    catatan: { type: String, default: '' },
  },
  { timestamps: true }
);

// Mencegah 1 karyawan dinilai dua kali pada bulan/periode yang sama
KinerjaSchema.index({ karyawanId: 1, periode: 1 }, { unique: true });

export const Kinerja = models.Kinerja || model<IKinerja>('Kinerja', KinerjaSchema);
