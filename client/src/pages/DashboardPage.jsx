import { createMemo, createResource } from 'solid-js';
import { useNavigate } from '@solidjs/router';

import { getKegiatanAll } from '../services/kegiatan.js';
import { getPegawai } from '../services/pegawai.js';

const CATEGORY_LABELS = {
  DLT: { bg: 'bg-orange-100', text: 'text-orange-700', full: 'Dinas Luar Tim' },
  TN: { bg: 'bg-violet-100', text: 'text-violet-700', full: 'Tugas Narsum' },
  DP: { bg: 'bg-emerald-100', text: 'text-emerald-700', full: 'Dalam Penugasan' },
  DLK: { bg: 'bg-cyan-100', text: 'text-cyan-700', full: 'Dinas Luar Kegiatan' },
  Lainnya: { bg: 'bg-slate-100', text: 'text-slate-700', full: 'Lainnya' },
};

const STATUS_LABELS = {
  Rencana: { bg: 'border-blue-200 bg-blue-50', dot: 'bg-blue-500' },
  Berlangsung: { bg: 'border-amber-200 bg-amber-50', dot: 'bg-amber-500' },
  Selesai: { bg: 'border-emerald-200 bg-emerald-50', dot: 'bg-emerald-500' },
  Dibatalkan: { bg: 'border-rose-200 bg-rose-50', dot: 'bg-rose-500' },
};

const normalizeStatus = (status) => {
  const statusValue = String(status || '')
    .trim()
    .toLowerCase();
  if (!statusValue) return 'Rencana';

  const map = {
    rencana: 'Rencana',
    terjadwal: 'Rencana',
    berlangsung: 'Berlangsung',
    selesai: 'Selesai',
    dibatalkan: 'Dibatalkan',
  };

  return map[statusValue] || status;
};

const normalizeCategory = (category) => {
  const value = String(category || '')
    .trim()
    .toUpperCase();
  if (!value) return 'Lainnya';
  return ['DLT', 'TN', 'DP', 'DLK'].includes(value) ? value : 'Lainnya';
};

const getPercent = (value, total) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

const formatDate = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [kegiatanData] = createResource(getKegiatanAll);
  const [pegawaiData] = createResource(getPegawai);

  const allKegiatan = () => {
    const value = kegiatanData();

    if (Array.isArray(value)) return value;
    if (value && Array.isArray(value.data)) return value.data;

    return [];
  };

  const allPegawai = () => {
    const value = pegawaiData();

    if (Array.isArray(value)) return value;
    if (value && Array.isArray(value.data)) return value.data;

    return [];
  };

  const totalKegiatan = () => allKegiatan().length;
  const totalPegawai = () => allPegawai().length;
  const totalDivisi = () => {
    const uniqueDivisi = new Set();

    for (const pegawai of allPegawai()) {
      const divisi = pegawai.divisi || pegawai.unit || 'Umum';
      uniqueDivisi.add(divisi);
    }

    return uniqueDivisi.size;
  };

  const statusSummary = () => {
    const summary = {
      Rencana: 0,
      Berlangsung: 0,
      Selesai: 0,
      Dibatalkan: 0,
    };

    for (const item of allKegiatan()) {
      const status = String(item.status || '')
        .trim()
        .toLowerCase();

      if (status === 'terjadwal' || status === 'rencana') {
        summary.Rencana += 1;
      } else if (status === 'berlangsung') {
        summary.Berlangsung += 1;
      } else if (status === 'selesai') {
        summary.Selesai += 1;
      } else if (status === 'dibatalkan') {
        summary.Dibatalkan += 1;
      }
    }

    const total = totalKegiatan();

    return {
      Rencana: { count: summary.Rencana, pct: getPercent(summary.Rencana, total) },
      Berlangsung: { count: summary.Berlangsung, pct: getPercent(summary.Berlangsung, total) },
      Selesai: { count: summary.Selesai, pct: getPercent(summary.Selesai, total) },
      Dibatalkan: { count: summary.Dibatalkan, pct: getPercent(summary.Dibatalkan, total) },
    };
  };

  const categoryStats = () => {
    const stats = {};

    for (const item of allKegiatan()) {
      const key = normalizeCategory(item.kategori);
      if (!(key in stats)) stats[key] = 0;
      stats[key] += 1;
    }

    const total = totalKegiatan();
    return ['DLT', 'TN', 'DP', 'DLK'].map((key) => {
      const count = stats[key] || 0;
      return {
        key,
        count,
        pct: getPercent(count, total),
        meta: CATEGORY_LABELS[key] || CATEGORY_LABELS.Lainnya,
      };
    });
  };

  const recentActivities = () => {
    return [...allKegiatan()]
      .sort((a, b) => new Date(b.waktu_mulai || b.waktu_selesai) - new Date(a.waktu_mulai || a.waktu_selesai))
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        kategori: normalizeCategory(item.kategori),
        status: normalizeStatus(item.status),
        namaKegiatan: item.nama_kegiatan,
        tanggalMulai: formatDate(item.waktu_mulai),
        pegawaiIds: Array.isArray(item.pegawai) ? item.pegawai : [],
      }));
  };

  const stats = createMemo(statusSummary);
  const totalAgenda = createMemo(totalKegiatan);

  const handleOpenEmployeeManager = () => navigate('/kegiatan');
  const handleSelectTab = (tab) => {
    if (tab === 'list') navigate('/kegiatan');
    if (tab === 'new') navigate('/kegiatan/baru');
  };
  const handleViewDetail = (item) => {
    console.log('View detail activity', item);
  };

  return (
    <div class='max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-6 animate-fade-in'>
      <div class='bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div class='space-y-1'>
          <div class='inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-extrabold border border-orange-200'>
            <span class='text-orange-500'>✦</span>
            <span>Dasbor Ringkasan Executif</span>
          </div>
          <h1 class='text-2xl font-black text-slate-900 tracking-tight'>Statistika & Pemantauan Kegiatan Dinas</h1>
          <p class='text-xs text-slate-500 font-medium'>
            Gambaran umum data kegiatan pegawai, status progres, dan distribusi kategori secara langsung.
          </p>
        </div>

        <div class='flex flex-wrap items-center gap-2.5'>
          <button
            type='button'
            onClick={() => handleSelectTab('new')}
            class='px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-2xl shadow-md shadow-orange-500/20 transition-all flex items-center space-x-2 cursor-pointer'
          >
            <span>➕</span>
            <span>Input Kegiatan</span>
          </button>

          <button
            type='button'
            onClick={() => handleSelectTab('list')}
            class='px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl transition-all flex items-center space-x-2 cursor-pointer'
          >
            <span class='text-amber-400'>☰</span>
            <span>Lihat Semua {totalAgenda()}</span>
          </button>
        </div>
      </div>

      <div class='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        <div class='lg:col-span-7 space-y-6'>
          <div class='bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4'>
            <div class='flex items-center justify-between border-b border-slate-100 pb-3'>
              <div class='flex items-center space-x-2'>
                <div class='p-2 bg-orange-50 text-orange-600 rounded-xl'>
                  <span>◉</span>
                </div>
                <div>
                  <h2 class='text-sm font-black text-slate-900 uppercase tracking-wide'>Statistika Status Progres</h2>
                  <p class='text-[11px] text-slate-500'>Proporsi progres kegiatan secara keseluruhan</p>
                </div>
              </div>
              <span class='text-xs font-extrabold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl'>100% Total</span>
            </div>

            <div class='space-y-2'>
              <div class='w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex'>
                <div
                  class='bg-emerald-500 h-full transition-all duration-500'
                  style={{ width: `${stats().Selesai.pct}%` }}
                />
                <div
                  class='bg-amber-500 h-full transition-all duration-500'
                  style={{ width: `${stats().Berlangsung.pct}%` }}
                />
                <div
                  class='bg-blue-500 h-full transition-all duration-500'
                  style={{ width: `${stats().Rencana.pct}%` }}
                />
                <div
                  class='bg-rose-500 h-full transition-all duration-500'
                  style={{ width: `${stats().Dibatalkan.pct}%` }}
                />
              </div>

              <div class='grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2'>
                <div class='p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/80'>
                  <div class='text-[10px] font-extrabold text-emerald-800 uppercase flex items-center space-x-1'>
                    <span class='w-2 h-2 rounded-full bg-emerald-500' />
                    <span>Selesai</span>
                  </div>
                  <div class='text-lg font-black text-emerald-900 mt-1'>
                    {stats().Selesai.count}{' '}
                    <span class='text-xs font-bold text-emerald-700'>({stats().Selesai.pct}%)</span>
                  </div>
                </div>

                <div class='p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80'>
                  <div class='text-[10px] font-extrabold text-amber-800 uppercase flex items-center space-x-1'>
                    <span class='w-2 h-2 rounded-full bg-amber-500' />
                    <span>Berlangsung</span>
                  </div>
                  <div class='text-lg font-black text-amber-900 mt-1'>
                    {stats().Berlangsung.count}{' '}
                    <span class='text-xs font-bold text-amber-700'>({stats().Berlangsung.pct}%)</span>
                  </div>
                </div>

                <div class='p-3 bg-blue-50/70 rounded-2xl border border-blue-200/80'>
                  <div class='text-[10px] font-extrabold text-blue-800 uppercase flex items-center space-x-1'>
                    <span class='w-2 h-2 rounded-full bg-blue-500' />
                    <span>Rencana</span>
                  </div>
                  <div class='text-lg font-black text-blue-900 mt-1'>
                    {stats().Rencana.count}{' '}
                    <span class='text-xs font-bold text-blue-700'>({stats().Rencana.pct}%)</span>
                  </div>
                </div>

                <div class='p-3 bg-rose-50/70 rounded-2xl border border-rose-200/80'>
                  <div class='text-[10px] font-extrabold text-rose-800 uppercase flex items-center space-x-1'>
                    <span class='w-2 h-2 rounded-full bg-rose-500' />
                    <span>Dibatalkan</span>
                  </div>
                  <div class='text-lg font-black text-rose-900 mt-1'>
                    {stats().Dibatalkan.count}{' '}
                    <span class='text-xs font-bold text-rose-700'>({stats().Dibatalkan.pct}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class='bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4'>
            <div class='flex items-center justify-between border-b border-slate-100 pb-3'>
              <div class='flex items-center space-x-2'>
                <div class='p-2 bg-orange-50 text-orange-600 rounded-xl'>
                  <span>▤</span>
                </div>
                <div>
                  <h2 class='text-sm font-black text-slate-900 uppercase tracking-wide'>
                    Statistika Kategori Kegiatan
                  </h2>
                  <p class='text-[11px] text-slate-500'>Distribusi berdasarkan jenis penugasan dinas</p>
                </div>
              </div>
            </div>

            <div class='space-y-3'>
              {categoryStats().length === 0 ? (
                <div class='py-4 text-center text-xs text-slate-400'>Belum ada data kategori.</div>
              ) : (
                categoryStats().map((item) => (
                  <div class='p-3 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-2'>
                    <div class='flex items-center justify-between text-xs'>
                      <div class='flex items-center space-x-2'>
                        <span
                          class={`px-2.5 py-0.5 rounded-lg font-black text-[10px] ${item.meta.bg} ${item.meta.text}`}
                        >
                          {item.key}
                        </span>
                        <span class='font-extrabold text-slate-900'>{item.meta.full}</span>
                      </div>
                      <span class='font-black text-slate-900'>
                        {item.count} Kegiatan <span class='text-slate-400 font-bold'>({item.pct}%)</span>
                      </span>
                    </div>

                    <div class='w-full bg-slate-200/80 h-2 rounded-full overflow-hidden'>
                      <div
                        class='bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500'
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div class='lg:col-span-5 space-y-6'>
          <div class='bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4'>
            <div class='flex items-center justify-between border-b border-slate-100 pb-3'>
              <div class='flex items-center space-x-2'>
                <div class='p-2 bg-orange-50 text-orange-600 rounded-xl'>
                  <span>📅</span>
                </div>
                <div>
                  <h2 class='text-sm font-black text-slate-900 uppercase tracking-wide'>Agenda Terbaru</h2>
                  <p class='text-[11px] text-slate-500'>Aktivitas kegiatan terdaftar terkini</p>
                </div>
              </div>

              <button
                type='button'
                onClick={() => handleSelectTab('list')}
                class='text-xs font-bold text-orange-600 hover:underline flex items-center space-x-1'
              >
                <span>Semua</span>
                <span>→</span>
              </button>
            </div>

            <div class='space-y-3'>
              {recentActivities().length === 0 ? (
                <div class='py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200'>
                  Belum ada kegiatan yang dicatat.
                </div>
              ) : (
                recentActivities().map((act) => {
                  const catMeta = CATEGORY_LABELS[act.kategori] || CATEGORY_LABELS.Lainnya;
                  const statusMeta = STATUS_LABELS[act.status] || STATUS_LABELS.Rencana;

                  return (
                    <div
                      onClick={() => handleViewDetail(act)}
                      class='p-3.5 bg-slate-50 hover:bg-orange-50/50 border border-slate-200/80 hover:border-orange-200 rounded-2xl transition-all cursor-pointer space-y-2 group'
                    >
                      <div class='flex items-center justify-between'>
                        <span class={`px-2 py-0.5 rounded-md text-[10px] font-black ${catMeta.bg} ${catMeta.text}`}>
                          {act.kategori}
                        </span>
                        <span
                          class={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${statusMeta.bg}`}
                        >
                          <span class={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                          <span>{act.status}</span>
                        </span>
                      </div>

                      <h3 class='text-xs font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1'>
                        {act.namaKegiatan}
                      </h3>

                      <div class='flex items-center justify-between text-[11px] text-slate-500 font-medium'>
                        <span class='flex items-center space-x-1 text-slate-700'>
                          <span class='text-orange-500'>📆</span>
                          <span>{act.tanggalMulai}</span>
                        </span>
                        <span class='flex items-center space-x-1 text-slate-600'>
                          <span class='text-indigo-500'>👥</span>
                          <span>{act.pegawaiIds.length} Pegawai</span>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div class='p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl space-y-2'>
              <div class='text-xs font-black text-amber-300 flex items-center space-x-1.5'>
                <span class='text-amber-400'>⚡</span>
                <span>Cetak & Ekspor Laporan PDF</span>
              </div>
              <p class='text-[11px] text-slate-300'>
                Gunakan menu daftar kegiatan untuk menyaring data dan mencetak laporan resmi format A4 PDF.
              </p>
              <button
                type='button'
                onClick={() => handleSelectTab('list')}
                class='mt-1 px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer'
              >
                Buka Daftar & Cetak PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
