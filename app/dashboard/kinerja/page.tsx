'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface KaryawanOption {
  _id: string;
  nip: string;
  nama: string;
  divisi: string;
  jabatan: string;
  status: string;
}

interface KinerjaItem {
  _id: string;
  karyawanId: {
    _id: string;
    nip: string;
    nama: string;
    divisi: string;
    jabatan: string;
  } | null;
  periode: string;
  kedisiplinan: number;
  kualitasKerja: number;
  produktivitas: number;
  kerjaSama: number;
  nilaiAkhir: number;
  predikat: string;
  catatan: string;
}
export default function KinerjaPage() {
  const [listKaryawan, setListKaryawan] = useState<KaryawanOption[]>([]);
  const [listKinerja, setListKinerja] = useState<KinerjaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pesan, setPesan] = useState({ teks: '', tipe: '' });

  const [karyawanId, setKaryawanId] = useState('');
  const [periode, setPeriode] = useState('2026-11');
  const [kedisiplinan, setKedisiplinan] = useState('80');
  const [kualitasKerja, setKualitasKerja] = useState('80');
  const [produktivitas, setProduktivitas] = useState('80');
  const [kerjaSama, setKerjaSama] = useState('80');
  const [catatan, setCatatan] = useState('');
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resKaryawan, resKinerja] = await Promise.all([
        fetch('/api/karyawan'),
        fetch('/api/kinerja'),
      ]);
      const jsonKaryawan = await resKaryawan.json();
      const jsonKinerja = await resKinerja.json();

      if (resKaryawan.ok) {
        const aktif = (jsonKaryawan.data || []).filter(
          (k: KaryawanOption) => k.status === 'aktif'
        );
        setListKaryawan(aktif);
      }
      if (resKinerja.ok) {
        setListKinerja(jsonKinerja.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setPesan({ teks: '', tipe: '' });

    try {
      const res = await fetch('/api/kinerja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          karyawanId,
          periode,
          kedisiplinan: Number(kedisiplinan),
          kualitasKerja: Number(kualitasKerja),
          produktivitas: Number(produktivitas),
          kerjaSama: Number(kerjaSama),
          catatan,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPesan({ teks: data.message || 'Gagal menyimpan penilaian', tipe: 'error' });
      } else {
        setPesan({ teks: data.message, tipe: 'sukses' });
        setKaryawanId('');
        setCatatan('');
        fetchData();
      }
    } catch {
      setPesan({ teks: 'Gagal terhubung ke server', tipe: 'error' });
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data penilaian kinerja ini?')) return;

    try {
      const res = await fetch(`/api/kinerja/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setPesan({ teks: data.message, tipe: 'sukses' });
        fetchData();
      } else {
        setPesan({ teks: data.message, tipe: 'error' });
      }
    } catch {
      setPesan({ teks: 'Gagal menghapus data', tipe: 'error' });
    }
  };

  const warnaPredikat = (predikat: string) => {
    if (predikat === 'Sangat Baik') return 'bg-green-100 text-green-700';
    if (predikat === 'Baik') return 'bg-blue-100 text-blue-700';
    if (predikat === 'Cukup') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Penilaian Kinerja Karyawan</h1>
            <p className="text-sm text-gray-500">Evaluasi indikator kinerja bulanan karyawan</p>
          </div>
          <Link
            href="/dashboard"
            className="bg-gray-700 hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-lg"
          >
            &larr; Kembali ke Dashboard
          </Link>
        </div>

        {pesan.teks && (
          <div
            className={`p-3 rounded-lg mb-6 text-sm ${
              pesan.tipe === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}
          >
            {pesan.teks}
          </div>
        )}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Input Penilaian Kinerja</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Pilih Karyawan</label>
              <select
                required
                value={karyawanId}
                onChange={(e) => setKaryawanId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              >
                <option value="">-- Pilih Karyawan Aktif --</option>
                {listKaryawan.map((k) => (
                  <option key={k._id} value={k._id}>
                    {k.nip} - {k.nama} ({k.divisi})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Periode (Bulan)</label>
              <input
                type="month"
                required
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Kedisiplinan (0 - 100)
              </label>
              <input
                type="number"
                required
                min="0"
                max="100"
                value={kedisiplinan}
                onChange={(e) => setKedisiplinan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Kualitas Kerja (0 - 100)
              </label>
              <input
                type="number"
                required
                min="0"
                max="100"
                value={kualitasKerja}
                onChange={(e) => setKualitasKerja(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Produktivitas (0 - 100)
              </label>
              <input
                type="number"
                required
                min="0"
                max="100"
                value={produktivitas}
                onChange={(e) => setProduktivitas(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Kerja Sama (0 - 100)
              </label>
              <input
                type="number"
                required
                min="0"
                max="100"
                value={kerjaSama}
                onChange={(e) => setKerjaSama(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Catatan Evaluasi (Opsional)
              </label>
              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Catatan tambahan dari atasan/HRD..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              />
            </div>

            <div className="md:col-span-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg disabled:opacity-50"
              >
                {submitting ? 'Menyimpan...' : 'Simpan Penilaian'}
              </button>
            </div>
          </form>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
                  <th className="py-3 px-4">Periode</th>
                  <th className="py-3 px-4">Karyawan</th>
                  <th className="py-3 px-4 text-center">Rincian Nilai</th>
                  <th className="py-3 px-4 text-center">Nilai Akhir</th>
                  <th className="py-3 px-4 text-center">Predikat</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      Memuat data penilaian...
                    </td>
                  </tr>
                ) : listKinerja.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      Belum ada data penilaian kinerja.
                    </td>
                  </tr>
                ) : (
                  listKinerja.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{item.periode}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">
                          {item.karyawanId?.nama || 'Karyawan Dihapus'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.karyawanId?.nip} - {item.karyawanId?.divisi}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-xs text-gray-600">
                        D:{item.kedisiplinan} | K:{item.kualitasKerja} | P:{item.produktivitas} | S:{item.kerjaSama}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-gray-900">
                        {item.nilaiAkhir}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${warnaPredikat(
                            item.predikat
                          )}`}
                        >
                          {item.predikat}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-600 hover:underline font-medium text-xs"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
