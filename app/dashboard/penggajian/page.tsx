'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface KaryawanOption {
  _id: string;
  nip: string;
  nama: string;
  divisi: string;
  gajiPokok: number;
  status: string;
}

interface PenggajianItem {
  _id: string;
  karyawanId: {
    _id: string;
    nip: string;
    nama: string;
    divisi: string;
    jabatan: string;
  } | null;
  periode: string;
  gajiPokok: number;
  nilaiKinerja: number;
  predikatKinerja: string;
  bonusKinerja: number;
  tunjangan: number;
  potongan: number;
  totalGaji: number;
  statusBayar: 'draft' | 'dibayar';
}

//2

export default function PenggajianPage() {
  const [listKaryawan, setListKaryawan] = useState<KaryawanOption[]>([]);
  const [listGaji, setListGaji] = useState<PenggajianItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pesan, setPesan] = useState({ teks: '', tipe: '' });

  const [karyawanId, setKaryawanId] = useState('');
  const [periode, setPeriode] = useState('2026-11');
  const [tunjangan, setTunjangan] = useState('0');
  const [potongan, setPotongan] = useState('0');

  //3

    const fetchData = async () => {
    setLoading(true);
    try {
      const [resKaryawan, resGaji] = await Promise.all([
        fetch('/api/karyawan'),
        fetch('/api/penggajian'),
      ]);

      if (resKaryawan.ok) {
        const jsonKaryawan = await resKaryawan.json();
        const aktif = (jsonKaryawan.data || []).filter(
          (k: KaryawanOption) => k.status === 'aktif'
        );
        setListKaryawan(aktif);
      }

      if (resGaji.ok) {
        const jsonGaji = await resGaji.json();
        setListGaji(jsonGaji.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  //4

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setPesan({ teks: '', tipe: '' });

    try {
      const res = await fetch('/api/penggajian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          karyawanId,
          periode,
          tunjangan: Number(tunjangan) || 0,
          potongan: Number(potongan) || 0,
          statusBayar: 'draft',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPesan({ teks: data.message || 'Gagal memproses gaji', tipe: 'error' });
      } else {
        setPesan({ teks: data.message, tipe: 'sukses' });
        setKaryawanId('');
        setTunjangan('0');
        setPotongan('0');
        fetchData();
      }
    } catch {
      setPesan({ teks: 'Gagal terhubung ke server', tipe: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  //5

    const handleBayar = async (id: string) => {
    if (!confirm('Tandai gaji ini sudah dibayarkan ke karyawan?')) return;

    try {
      const res = await fetch(`/api/penggajian/${id}`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok) {
        setPesan({ teks: data.message, tipe: 'sukses' });
        fetchData();
      } else {
        setPesan({ teks: data.message, tipe: 'error' });
      }
    } catch {
      setPesan({ teks: 'Gagal mengubah status', tipe: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus slip gaji ini?')) return;

    try {
      const res = await fetch(`/api/penggajian/${id}`, { method: 'DELETE' });
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

  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);

    //6

      return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Penggajian Karyawan (Payroll)</h1>
            <p className="text-sm text-gray-500">
              Kalkulasi gaji pokok, bonus kinerja otomatis, tunjangan, dan potongan
            </p>
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
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Generate Gaji Bulanan</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Pilih Karyawan</label>
              <select
                required
                value={karyawanId}
                onChange={(e) => setKaryawanId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              >
                <option value="">-- Pilih Karyawan --</option>
                {listKaryawan.map((k) => (
                  <option key={k._id} value={k._id}>
                    {k.nip} - {k.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Periode Bulan</label>
              <input
                type="month"
                required
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tunjangan (Rp)</label>
              <input
                type="number"
                min="0"
                value={tunjangan}
                onChange={(e) => setTunjangan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Potongan (Rp)</label>
              <input
                type="number"
                min="0"
                value={potongan}
                onChange={(e) => setPotongan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              />
            </div>

            <div className="md:col-span-4 pt-2 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                *Bonus kinerja otomatis diambil dari hasil Penilaian Kinerja pada periode yang sama.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg disabled:opacity-50"
              >
                {submitting ? 'Menghitung...' : 'Hitung & Buat Slip Gaji'}
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
                  <th className="py-3 px-4">Gaji Pokok</th>
                  <th className="py-3 px-4">Bonus Kinerja</th>
                  <th className="py-3 px-4">Tunj. / Pot.</th>
                  <th className="py-3 px-4">Total Gaji</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm text-gray-700">


                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-gray-500">
                      Memuat data penggajian...
                    </td>
                  </tr>
                ) : listGaji.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-gray-500">
                      Belum ada data penggajian.
                    </td>
                  </tr>
                ) : (
                  listGaji.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{item.periode}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">
                          {item.karyawanId?.nama || 'Karyawan Dihapus'}
                        </div>
                        <div className="text-xs text-gray-500">{item.karyawanId?.nip}</div>
                      </td>
                      <td className="py-3 px-4">{formatRupiah(item.gajiPokok)}</td>
                      <td className="py-3 px-4">
                        <div className="text-green-700 font-medium">
                          +{formatRupiah(item.bonusKinerja)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.predikatKinerja} ({item.nilaiKinerja})
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <div className="text-blue-600">+{formatRupiah(item.tunjangan)}</div>
                        <div className="text-red-600">-{formatRupiah(item.potongan)}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        {formatRupiah(item.totalGaji)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium uppercase ${
                            item.statusBayar === 'dibayar'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {item.statusBayar}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center space-x-2">
                        {item.statusBayar === 'draft' && (
                          <button
                            onClick={() => handleBayar(item._id)}
                            className="text-green-600 hover:underline font-medium text-xs"
                          >
                            Bayar
                          </button>
                        )}
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
