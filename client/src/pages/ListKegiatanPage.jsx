import { createSignal, For, Show, createResource, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';

import {
  FiFileMinus,
  FiUsers,
  FiInbox,
  FiMapPin,
  FiPrinter,
  FiPlus,
  FiCalendar,
  FiClock,
  FiSearch,
  FiRefreshCw,
  FiCheckCircle,
} from 'solid-icons/fi';

import { formatKegiatanWaktu } from '../utils/date.js';
import { getKegiatanAll, deleteKegiatan } from '../services/kegiatan.js';
import { getPegawai } from '../services/pegawai.js';

import { Badge } from '../components/ui/Badge';
import { KategoriBadge } from '../components/common/KategoriBadge';
import { StatusLabel } from '../components/common/StatusLabel';
import DetailModal from '../components/layout/DetailModal';

import { setSidebar, closeSidebar } from '../stores/sidebar-store';
import { getStatusLabel } from '../data/kegiatan.js';

export default function ListKegiatanPage() {
  const navigate = useNavigate();

  const [dataKegiatan, { refetch: refetchKegiatan }] = createResource(getKegiatanAll);
  const [pegawaiList] = createResource(getPegawai);

  // Filter signals
  const [search, setSearch] = createSignal('');
  const [kategoriFilter, setKategoriFilter] = createSignal('semua');
  const [statusFilter, setStatusFilter] = createSignal('semua');
  const [pegawaiFilter, setPegawaiFilter] = createSignal('semua');
  const [tanggalMulai, setTanggalMulai] = createSignal('');
  const [tanggalSelesai, setTanggalSelesai] = createSignal('');
  const [sortOrder, setSortOrder] = createSignal('terbaru');
  const [selectedKegiatan, setSelectedKegiatan] = createSignal(null);

  const openDetail = (item) => {
    setSelectedKegiatan(item);
  };

  const closeDetail = () => {
    setSelectedKegiatan(null);
  };

  const handleEditKegiatan = (item) => {
    closeDetail();
    navigate(`/kegiatan/edit/${item.id}`);
  };

  const handleDeleteKegiatan = async (id) => {
    const confirmed = window.confirm('Apakah Anda yakin ingin menghapus kegiatan ini?');
    if (!confirmed) return;

    try {
      await deleteKegiatan(id);
      closeDetail();
      await refetchKegiatan();
    } catch (error) {
      alert(error.message || 'Gagal menghapus kegiatan');
    }
  };

  const filteredKegiatan = () => {
    const all = dataKegiatan() || [];
    const q = (search() || '').toLowerCase().trim();
    const normalizedStatusFilter = String(statusFilter() || '')
      .trim()
      .toLowerCase();

    let res = all.filter((item) => {
      if (
        kategoriFilter() !== 'semua' &&
        String(item.kategori || '').toUpperCase() !== String(kategoriFilter()).toUpperCase()
      )
        return false;
      if (
        normalizedStatusFilter !== 'semua' &&
        String(item.status || '')
          .trim()
          .toLowerCase() !== normalizedStatusFilter
      )
        return false;
      if (pegawaiFilter() !== 'semua') {
        const pid = Number(pegawaiFilter());
        if (!item.pegawai || !item.pegawai.some((p) => Number(p.id) === pid)) return false;
      }

      if (q) {
        const inNama = item.nama_kegiatan && item.nama_kegiatan.toLowerCase().includes(q);
        const inLokasi = item.lokasi && item.lokasi.toLowerCase().includes(q);
        const inOutput = item.output && item.output.toLowerCase().includes(q);
        const inPegawai = (item.pegawai || []).some((p) => p.nama && p.nama.toLowerCase().includes(q));
        if (!inNama && !inLokasi && !inOutput && !inPegawai) return false;
      }

      if (tanggalMulai()) {
        const start = new Date(tanggalMulai());
        if (new Date(item.waktu_mulai) < start) return false;
      }
      if (tanggalSelesai()) {
        const end = new Date(tanggalSelesai());
        if (new Date(item.waktu_mulai) > end) return false;
      }

      return true;
    });

    res = res.sort((a, b) => {
      const ta = new Date(a.created_at || a.waktu_mulai).getTime();
      const tb = new Date(b.created_at || b.waktu_mulai).getTime();
      return sortOrder() === 'terlama' ? ta - tb : tb - ta;
    });

    return res;
  };

  createEffect(() => {
    console.log('LOADING:', dataKegiatan.loading);
    console.log('ERROR:', dataKegiatan.error);
    console.log('DATA:', dataKegiatan());
  });

  return (
    <div class=':uno: animate-fade-in'>
      {/* Container */}
      <div class=':uno: space-y-6'>
        {/* Card: Page Header */}
        <div class=':uno: flex flex-col items-start gap-2 bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 rounded-3xl p-6 layout-dark shadow-xs'>
          <Badge color='yellow' size='md'>
            <FiFileMinus size={16} stroke-width={2} /> Arsip Digital Kegiatan Dinas
          </Badge>

          <div class=':uno: flex flex-col lg:(flex-row justify-between) gap-6 w-full'>
            <div>
              <h1 class=':uno: text-2xl font-bold md:font-black text-[var(--title)]'>
                Daftar Kegiatan & Tugas Pegawai
              </h1>
              <p class=':uno: text-xs text-[var(--text-muted)] mt-1'>
                Menampilkan agenda kegiatan pegawai dengan filter sederhana dan opsi pencetakan.
              </p>
            </div>

            <div class=':uno: flex flex-col gap-2 items-end justify-center md:(flex-row justify-end)'>
              <button
                type='button'
                class=':uno: flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r text-nowrap from-orange-500 to-amber-500 text-white rounded-2xl text-xs font-bold cursor-pointer'
              >
                <FiPrinter size={16} stroke-width={2} /> Cetak Laporan PDF
              </button>

              <button
                type='button'
                onClick={() => navigate('/kegiatan/baru', { replace: true })}
                class=':uno: flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-2xl text-xs font-bold border border-slate-700 text-nowrap cursor-pointer'
              >
                <div class=':uno: text-orange-400'>
                  <FiPlus size={16} stroke-width={2} />
                </div>
                Tambah Data
              </button>
            </div>
          </div>
        </div>

        {/* Card: Summary */}
        <div class=':uno: layout-dark grid grid-cols-2 lg:grid-cols-4 gap-3.5'>
          <div class=':uno: p-4 rounded-3xl bg-white text-slate-900 border border-slate-200 flex items-center space-x-3.5 transition-all duration-200 ease-out transform-gpu hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-700/10'>
            <div class=':uno: w-11 h-11 rounded-2xl flex items-center text-orange-500/60 bg-orange-500/20 border border-orange-500/40 justify-center font-bold shrink-0'>
              <FiInbox size={20} stroke-width={1.5} />
            </div>

            <div>
              <p class=':uno: text-[10px] font-extrabold uppercase text-slate-500 tracking-wider'>Total Kegiatan</p>
              <p class=':uno: text-xl text-slate-900 font-black'>
                {dataKegiatan.loading ? '...' : dataKegiatan()?.length}
                <span class=':uno: text-xs font-normal opacity-70 pl-1.5'>agenda</span>
              </p>
            </div>
          </div>
          <div class=':uno: p-4 rounded-3xl bg-white text-slate-900 border border-slate-200 flex items-center space-x-3.5 transition-all duration-200 ease-out transform-gpu hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-700/10'>
            <div class=':uno: w-11 h-11 rounded-2xl flex items-center text-yellow-500/60 bg-yellow-500/20 border border-yellow-500/40 justify-center font-bold shrink-0'>
              <FiClock size={20} stroke-width={1.5} />
            </div>
            <div>
              <p class=':uno: text-[10px] font-extrabold uppercase text-slate-500 tracking-wider'>Berlangsung</p>
              <p class=':uno: text-xl text-slate-900 font-black'>
                {dataKegiatan.loading
                  ? '...'
                  : dataKegiatan()?.filter(
                      (item) =>
                        String(item.status || '')
                          .trim()
                          .toLowerCase() === 'berlangsung',
                    ).length}
                <span class=':uno: text-xs font-normal opacity-70 pl-1.5'>kegiatan</span>
              </p>
            </div>
          </div>
          <div class=':uno: p-4 rounded-3xl bg-white text-slate-900 border border-slate-200 flex items-center space-x-3.5 transition-all duration-200 ease-out transform-gpu hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-700/10'>
            <div class=':uno: w-11 h-11 rounded-2xl flex items-center text-sky-500/40 bg-sky-500/10 border border-sky-500/40 justify-center font-bold shrink-0'>
              <FiCalendar size={20} stroke-width={1.5} />
            </div>
            <div>
              <p class=':uno: text-[10px] font-extrabold uppercase text-slate-500 tracking-wider'>Rencana Agenda</p>
              <p class=':uno: text-xl text-slate-900 font-black'>
                {dataKegiatan.loading
                  ? '...'
                  : dataKegiatan()?.filter(
                      (item) =>
                        String(item.status || '')
                          .trim()
                          .toLowerCase() === 'terjadwal',
                    ).length}
                <span class=':uno: text-xs font-normal opacity-70 pl-1.5'>kegiatan</span>
              </p>
            </div>
          </div>
          <div class=':uno: p-4 rounded-3xl bg-white text-slate-900 border border-slate-200 flex items-center space-x-3.5 transition-all duration-200 ease-out transform-gpu hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-700/10'>
            <div class=':uno: w-11 h-11 rounded-2xl flex items-center text-green-500/40 bg-green-500/10 border border-green-500/20 justify-center font-bold shrink-0'>
              <FiCheckCircle size={20} stroke-width={1.5} />
            </div>
            <div>
              <p class=':uno: text-[10px] font-extrabold uppercase text-slate-500 tracking-wider'>Selesai</p>
              <p class=':uno: text-xl text-slate-900 font-black'>
                {dataKegiatan.loading
                  ? '...'
                  : dataKegiatan()?.filter(
                      (item) =>
                        String(item.status || '')
                          .trim()
                          .toLowerCase() === 'selesai',
                    ).length}
                <span class=':uno: text-xs font-normal opacity-70 pl-1.5'>kegiatan</span>
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Search Toolbar (styled) */}
        <div class=':uno: layout-light bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs p-4 sm:p-5'>
          <div class=':uno:'>
            <div class=':uno: mb-3'>
              <div class=':uno: relative'>
                <span class=':uno: absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400'>
                  <FiSearch class='w-4 h-4' />
                </span>
                <label for='filter-search' class=':uno: sr-only'>
                  Cari
                </label>
                <input
                  id='filter-search'
                  type='text'
                  placeholder='Cari nama kegiatan, deskripsi, lokasi, pelaksana...'
                  value={search()}
                  onInput={(e) => setSearch(e.currentTarget.value)}
                  class=':uno: pl-10 pr-3 py-3 text-xs text-[var(--text)] w-full bg-slate-50/50 border border-slate-200 rounded-xl focus:(border-primary/80 outline-2 outline-primary/20) transition-colors duration-200'
                />
              </div>
            </div>

            <div class=':uno: grid grid-cols-2 md:grid-cols-4 gap-3'>
              <div>
                <label for='filter-kategori' class=':uno: block mb-1.5 text-xs text-[var(--title)]/80 font-semibold'>
                  Kategori
                </label>
                <select
                  id='filter-kategori'
                  value={kategoriFilter()}
                  onInput={(e) => setKategoriFilter(e.currentTarget.value)}
                  class=':uno: py-2.5 px-3 text-xs text-[var(--text)] w-full bg-slate-50/50 border border-slate-200 rounded-xl focus:(border-primary/80 outline-2 outline-primary/20) transition-colors duration-200'
                >
                  <option value='semua'>Semua Kategori</option>
                  <option value='DLT'>DLT</option>
                  <option value='TN'>TN</option>
                  <option value='DP'>DP</option>
                  <option value='DLK'>DLK</option>
                </select>
              </div>

              <div>
                <label for='filter-status' class=':uno: block mb-1.5 text-xs text-[var(--title)]/80 font-semibold'>
                  Status Kegiatan
                </label>
                <select
                  id='filter-status'
                  value={statusFilter()}
                  onInput={(e) => setStatusFilter(e.currentTarget.value)}
                  class=':uno: w-full px-3 py-2.5 text-xs text-[var(--text)] rounded-xl border border-slate-200 bg-slate-50/50 focus:(border-primary/80 outline-2 outline-primary/20) transition-colors duration-200'
                >
                  <option value='semua'>Semua Status</option>
                  <option value='terjadwal'>Terjadwal</option>
                  <option value='berlangsung'>Berlangsung</option>
                  <option value='selesai'>Selesai</option>
                  <option value='dibatalkan'>Dibatalkan</option>
                </select>
              </div>

              <div>
                <label for='filter-pegawai' class=':uno: block mb-1.5 text-xs text-[var(--title)]/80 font-semibold'>
                  Diikuti Pegawai
                </label>
                <select
                  id='filter-pegawai'
                  value={pegawaiFilter()}
                  onInput={(e) => setPegawaiFilter(e.currentTarget.value)}
                  class=':uno: py-2.5 px-3 text-xs text-[var(--text)] w-full bg-slate-50/50 border border-slate-200 rounded-xl focus:(border-primary/80 outline-2 outline-primary/20) transition-colors duration-200'
                >
                  <option value='semua'>Semua Pegawai</option>
                  <For each={pegawaiList() || []}>{(p) => <option value={p.id}>{p.nama}</option>}</For>
                </select>
              </div>

              <div>
                <label for='filter-sort' class=':uno: block mb-1.5 text-xs text-[var(--title)]/80 font-semibold'>
                  Urutan Waktu
                </label>
                <select
                  id='filter-sort'
                  value={sortOrder()}
                  onInput={(e) => setSortOrder(e.currentTarget.value)}
                  class=':uno: py-2.5 px-3 text-xs text-[var(--text)] w-full bg-slate-50/50 border border-slate-200 rounded-xl focus:(border-primary/80 outline-2 outline-primary/20) transition-colors duration-200'
                >
                  <option value='terbaru'>Terbaru Pertama</option>
                  <option value='terlama'>Terlama Pertama</option>
                </select>
              </div>
            </div>

            <div class=':uno: mt-4 border-t border-slate-100 pt-3 flex items-center justify-between'>
              <div class=':uno: flex items-center text-slate-500 gap-2'>
                <FiRefreshCw class='w-4 h-4' />
                <span class=':uno: text-sm'>
                  Reset (
                  {(() => {
                    let c = 0;
                    if (search().trim() !== '') c++;
                    if (kategoriFilter() !== 'semua') c++;
                    if (statusFilter() !== 'semua') c++;
                    if (pegawaiFilter() !== 'semua') c++;
                    if (sortOrder() !== 'terbaru') c++;
                    return c;
                  })()}
                  )
                </span>
              </div>

              <div>
                <button
                  type='button'
                  onClick={() => {
                    setSearch('');
                    setKategoriFilter('semua');
                    setStatusFilter('semua');
                    setPegawaiFilter('semua');
                    setSortOrder('terbaru');
                  }}
                  class=':uno: px-4 py-2 rounded-xl bg-slate-800 text-white'
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class=':uno: layout-light bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs relative'>
          <div class='overflow-x-auto w-full'>
            <table class='w-full text-left border-collapse'>
              <thead>
                <tr class='bg-slate-50 border-b border-slate-200/90 text-[11px] font-black text-slate-600 uppercase tracking-wider'>
                  <th class='py-4 px-4 w-12 text-center'>No</th>
                  <th class='py-4 px-4'>Nama Kegiatan</th>
                  <th class='py-4 px-4'>Kategori</th>
                  <th class='py-4 px-4'>Jadwal Waktu</th>
                  <th class='py-4 px-4'>Lokasi</th>
                  <th class='py-4 px-4'>Pelaksana</th>
                  <th class='py-4 px-4'>Status</th>
                </tr>
              </thead>
              <tbody class='divide-y divide-slate-100 text-xs text-slate-800'>
                <For each={filteredKegiatan()}>
                  {(item, index) => {
                    const waktu = formatKegiatanWaktu(item.waktu_mulai, item.waktu_selesai);

                    return (
                      <tr
                        class='cursor-pointer transition-colors hover:bg-[var(--surface-alt)]'
                        onClick={() => openDetail(item)}
                      >
                        <td class='py-3.5 px-4 text-center font-mono font-extrabold text-slate-400'>{index() + 1}</td>

                        <td class='py-3.5 px-4 max-w-xs'>
                          <div class='font-extrabold text-slate-900 text-sm line-clamp-2 transition-colors'>
                            {item.nama_kegiatan}
                          </div>
                          {item.output && (
                            <p class='text-[11px] text-slate-400 line-clamp-1 mt-0.5'>Output: {item.output}</p>
                          )}
                        </td>

                        <td class='py-3.5 px-4 whitespace-nowrap'>
                          <KategoriBadge type={item.kategori} />
                        </td>

                        <td class='py-3.5 px-4 whitespace-nowrap'>
                          <div class='font-bold text-slate-900 flex items-center space-x-1.5'>
                            <FiCalendar class='w-3.5 h-3.5 text-orange-500 shrink-0' />
                            <span>{waktu.date}</span>
                          </div>
                          <div class='text-[11px] text-slate-500 font-mono mt-0.5 flex items-center space-x-1'>
                            <FiClock class='w-3 h-3 text-slate-400 shrink-0' />
                            <span>{waktu.time} WIB</span>
                          </div>
                        </td>

                        <td class='py-3.5 px-4 max-w-[170px]'>
                          <div
                            class='flex items-center space-x-1.5 text-slate-700 font-medium truncate'
                            title={item.lokasi}
                          >
                            <FiMapPin class='w-3.5 h-3.5 text-rose-500 shrink-0' />
                            <span class='truncate'>{item.lokasi}</span>
                          </div>
                        </td>

                        <td class='py-3.5 px-4'>
                          <div class='flex items-center space-x-1.5'>
                            <FiUsers class='w-3.5 h-3.5 text-indigo-500 shrink-0' />
                            <span class='font-extrabold text-slate-900'>{item.pegawai.length} Orang</span>
                          </div>
                          <div class='text-[11px] text-slate-500 truncate max-w-[140px] font-medium'>
                            <For each={item.pegawai}>{(peg) => peg.nama}</For>
                          </div>
                        </td>

                        <td class='py-3.5 px-4 whitespace-nowrap'>
                          <StatusLabel label={getStatusLabel(item.status)} />
                        </td>
                      </tr>
                    );
                  }}
                </For>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <DetailModal
        kegiatan={selectedKegiatan()}
        pegawaiList={pegawaiList() || []}
        onClose={closeDetail}
        onEdit={handleEditKegiatan}
        onDelete={handleDeleteKegiatan}
        isAdmin={true}
      />
    </div>
  );
}
