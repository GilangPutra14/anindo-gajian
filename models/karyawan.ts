import mongoose, { Schema, model, models } from 'mongoose';

export interface IKaryawan {
  _id?: string;
  nip: string;
  nama: string;
  jabatan: string;
  divisi: string;
  gajiPokok: number;
  status: 'aktif' | 'nonaktif';
  createdAt?: Date;
  updatedAt?: Date;
}

const KaryawanSchema = new Schema<IKaryawan>(
  {
    nip: { type: String, required: true, unique: true },
    nama: { type: String, required: true },
    jabatan: { type: String, required: true },
    divisi: { type: String, required: true },
    gajiPokok: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['aktif', 'nonaktif'], default: 'aktif' },
  },
  { timestamps: true }
);

export const Karyawan = models.Karyawan || model<IKaryawan>('Karyawan', KaryawanSchema);
