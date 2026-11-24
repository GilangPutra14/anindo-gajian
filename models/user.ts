import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
  _id?: string;
  nama: string;
  email: string;
  password?: string;
  role: 'admin' | 'karyawan';
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    nama: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'karyawan'], default: 'karyawan' },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>('User', UserSchema);
