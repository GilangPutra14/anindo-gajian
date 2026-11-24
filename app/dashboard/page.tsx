import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '@/components/logoutbutton';

async function DashboardContent() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  let userData = { nama: '', email: '', role: '' };

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    userData = {
      nama: payload.nama as string,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch {
    redirect('/login');
  }

  return (
    <>
      {/* Navbar Atas */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Sistem Informasi Anindo</h1>
          <p className="text-xs text-gray-500">Penggajian & Pelaporan Kinerja Karyawan</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">{userData.nama}</p>
            <span className="inline-block text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 uppercase font-medium">
              {userData.role}
            </span>
          </div>
          <LogoutButton />
        </div>
      </nav>

      {/* Konten Utama Dashboard */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Selamat Datang, {userData.nama}!
          </h2>
          <p className="text-sm text-gray-600">
            Anda login sebagai <strong className="uppercase">{userData.role}</strong> ({userData.email}).
          </p>
        </div>

        {/* Menu Modul Utama */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/dashboard/karyawan"
            className="block bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 transition"
          >
            <h3 className="font-bold text-gray-800 mb-1">Data Karyawan &rarr;</h3>
            <p className="text-sm text-gray-500 mb-4">
              Kelola profil, jabatan, dan gaji pokok karyawan.
            </p>
            <span className="text-xs bg-green-100 text-green-800 px-2.5 py-1 rounded-full font-medium">
              Aktif / Siap Digunakan
            </span>
          </Link>

          <Link
            href="/dashboard/kinerja"
            className="block bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 transition"
          >
            <h3 className="font-bold text-gray-800 mb-1">Penilaian Kinerja &rarr;</h3>
            <p className="text-sm text-gray-500 mb-4">
              Input dan evaluasi indikator kinerja bulanan.
            </p>
            <span className="text-xs bg-green-100 text-green-800 px-2.5 py-1 rounded-full font-medium">
              Aktif / Siap Digunakan
            </span>
          </Link>

          <Link
            href="/dashboard/penggajian"
            className="block bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 transition"
          >
            <h3 className="font-bold text-gray-800 mb-1">Penggajian (Payroll) &rarr;</h3>
            <p className="text-sm text-gray-500 mb-4">
              Perhitungan gaji otomatis, tunjangan, dan slip gaji.
            </p>
            <span className="text-xs bg-green-100 text-green-800 px-2.5 py-1 rounded-full font-medium">
              Aktif / Siap Digunakan
            </span>
          </Link>
        </div>
      </main>
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Suspense fallback={<div className="p-8 text-center text-gray-600">Memuat dashboard...</div>}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
