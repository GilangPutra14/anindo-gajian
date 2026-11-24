'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface KaryawanItem {
  _id: string;
  nip: string;
  nama: string;
  jabatan: string;
  divisi: string;
  gajiPokok: number;
  status: 'aktif' | 'nonaktif';
}
export default function KaryawanPage() {
  const [list, setList] = useState<KaryawanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [pesan, setPesan] = useState({ teks: '', tipe: '' });

  const [nip, setNip] = useState('');
  const [nama, setNama] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [divisi, setDivisi] = useState('');
  const [gajiPokok, setGajiPokok] = useState('');
  const [status, setStatus] = useState<'aktif' | 'nonaktif'>('aktif');
  const fetchKaryawan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/karyawan');
      const json = await res.json();
      if (res.ok) setList(json.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKaryawan();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setNip('');
    setNama('');
    setJabatan('');
    setDivisi('');
    setGajiPokok('');
    setStatus('aktif');
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setPesan({ teks: '', tipe: '' });

    try {
      const url = editId ? `/api/karyawan/${editId}` : '/api/karyawan';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nip,
          nama,
          jabatan,
          divisi,
          gajiPokok: Number(gajiPokok),
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPesan({ teks: data.message || 'Terjadi kesalahan', tipe: 'error' });
      } else {
        setPesan({ teks: data.message, tipe: 'sukses' });
        resetForm();
        fetchKaryawan();
      }
    } catch {
      setPesan({ teks: 'Gagal terhubung ke server', tipe: 'error' });
    } finally {
      setSubmitting(false);
    }
  };
  const handleEdit = (item: KaryawanItem) => {
    setEditId(item._id);
    setNip(item.nip);
    setNama(item.nama);
    setJabatan(item.jabatan);
    setDivisi(item.divisi);
    setGajiPokok(String(item.gajiPokok));
    setStatus(item.status);
    setPesan({ teks: '', tipe: '' });
  };

  const handleDelete = async (id: string, namaKaryawan: string) => {
    if (!confirm(`Yakin ingin menghapus data "${namaKaryawan}"?`)) return;

    try {
      const res = await fetch(`/api/karyawan/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setPesan({ teks: data.message, tipe: 'sukses' });
        fetchKaryawan();
      } else {
        setPesan({ teks: data.message, tipe: 'error' });
      }
    } catch {
      setPesan({ teks: 'Gagal menghapus data', tipe: 'error' });
    }
  };

  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Data Karyawan</h1>
            <p className="text-sm text-gray-500">Kelola data master karyawan Anindo</p>
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
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {editId ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">NIP</label>
              <input
                type="text"
                required
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="Contoh: EMP-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama lengkap karyawan"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Divisi</label>
              <input
                type="text"
                required
                value={divisi}
                onChange={(e) => setDivisi(e.target.value)}
                placeholder="Contoh: Produksi / QC"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Jabatan</label>
              <input
                type="text"
                required
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                placeholder="Contoh: Staff QC"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Gaji Pokok (Rp)</label>
              <input
                type="number"
                required
                min="0"
                value={gajiPokok}
                onChange={(e) => setGajiPokok(e.target.value)}
                placeholder="Contoh: 3500000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'aktif' | 'nonaktif')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>

            <div className="md:col-span-3 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg disabled:opacity-50"
              >
                {submitting ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Tambah Karyawan'}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium px-5 py-2.5 rounded-lg"
                >
                  Batal Edit
                </button>
              )}
            </div>
          </form>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
                  <th className="py-3 px-4">NIP</th>
                  <th className="py-3 px-4">Nama</th>
                  <th className="py-3 px-4">Divisi / Jabatan</th>
                  <th className="py-3 px-4">Gaji Pokok</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      Memuat data karyawan...
                    </td>
                  </tr>
                ) : list.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      Belum ada data karyawan.
                    </td>
                  </tr>
                ) : (
                  list.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{item.nip}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{item.nama}</td>
                      <td className="py-3 px-4">
                        <div>{item.divisi}</div>
                        <div className="text-xs text-gray-500">{item.jabatan}</div>
                      </td>
                      <td className="py-3 px-4">{formatRupiah(item.gajiPokok)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            item.status === 'aktif'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:underline font-medium text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, item.nama)}
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
