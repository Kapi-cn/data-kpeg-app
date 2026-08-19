import { createSignal, For, Show, onMount, createEffect } from 'solid-js';
import { useSearchParams, useNavigate, useParams } from '@solidjs/router';

import { getPegawai } from '../services/pegawai.js';
import { createKegiatan, updateKegiatan, getKegiatanAll } from '../services/kegiatan.js';

import {
  FiInfo,
  FiFilePlus,
  FiMapPin,
  FiClock,
  FiCheckCircle,
  FiRotateCcw,
  FiSave,
  FiUserPlus,
  FiUsers,
  FiSearch,
  FiX,
  FiCheckSquare,
  FiCheck,
  FiPrinter,
} from 'solid-icons/fi';

import { Badge } from '../components/ui/Badge';
import { KategoriBadge } from '../components/common/KategoriBadge';
import MasterPegawaiModal from '../components/layout/MasterPegawaiModal';
import PrintPdfModal from '../components/layout/PrintPdfModal';
import { STATUS_KEGIATAN, KATEGORI_LABEL, mapStatusToForm } from '../data/kegiatan.js';

function CardHeader(props) {
  return (
    <div class=':uno: layout-light flex items-center gap-3 py-3 border-b border-dashed border-[var(--border)]'>
      <div class=':uno: flex flex-shrink-0 items-center justify-center size-8 rounded-lg text-primary bg-primary/15'>
        {props.order}
      </div>
      <div class=':uno: space-y-1'>
        <h2 class=':uno: text-[var(--title)] font-bold text-xs uppercase tracking-tight'>{props.title}</h2>
        <p class=':uno: text-[11px] leading-3.5 text-[var(--text-muted)]'>{props.description}</p>
      </div>
    </div>
  );
}

export default function FormKegiatanPage() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const editId = () => {
    const raw = searchParams.id ?? params.id ?? 0;
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : null;
  };

  const [kategori, setKategori] = createSignal('DP');
  const [status, setStatus] = createSignal('terjadwal');

  // Form input signals
  const [namaKegiatan, setNamaKegiatan] = createSignal('');
  const [waktuMulai, setWaktuMulai] = createSignal('');
  const [waktuSelesai, setWaktuSelesai] = createSignal('');
  const [lokasiInput, setLokasiInput] = createSignal('');
  const [hasilKegiatanInput, setHasilKegiatanInput] = createSignal('');

  const toDateTimeLocal = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const handleResetForm = () => {
    setNamaKegiatan('');
    setKategori('DP');
    setStatus('terjadwal');
    setWaktuMulai('');
    setWaktuSelesai('');
    setLokasiInput('');
    setHasilKegiatanInput('');
    setSelectedPegawaiIds([]);
    setSearchPegawai('');
    setSelectedDivisi('semua');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      nama_kegiatan: namaKegiatan().trim(),
      kategori: kategori(),
      waktu_mulai: waktuMulai(),
      waktu_selesai: waktuSelesai(),
      status: status(),
      lokasi: lokasiInput().trim(),
      output: hasilKegiatanInput().trim(),
      pegawai_ids: selectedPegawaiIds(),
    };

    if (
      !payload.nama_kegiatan ||
      !payload.kategori ||
      !payload.waktu_mulai ||
      !payload.waktu_selesai ||
      !payload.lokasi
    ) {
      alert('Nama kegiatan, kategori, waktu mulai, waktu selesai, dan lokasi wajib diisi.');
      return;
    }

    if (new Date(payload.waktu_mulai) > new Date(payload.waktu_selesai)) {
      alert('Waktu selesai tidak boleh lebih awal dari waktu mulai.');
      return;
    }

    try {
      const currentId = editId();

      if (currentId) {
        await updateKegiatan(currentId, payload);
      } else {
        await createKegiatan(payload);
      }

      navigate('/kegiatan');
    } catch (error) {
      console.error('Submit kegiatan gagal', error);
      alert(error.message || 'Gagal menyimpan kegiatan.');
    }
  };

  const [pegawaiList, setPegawaiList] = createSignal([]);
  const [selectedPegawaiIds, setSelectedPegawaiIds] = createSignal([]);
  const [searchPegawai, setSearchPegawai] = createSignal('');
  const [pegawaiModalOpen, setPegawaiModalOpen] = createSignal(false);
  const [printModalOpen, setPrintModalOpen] = createSignal(false);

  createEffect(() => {
    if (searchParams.openEmployeeManager === '1') {
      setPegawaiModalOpen(true);
    }
  });

  const refreshPegawaiList = async () => {
    try {
      const data = await getPegawai();
      const mapped = (data || []).map((p, idx) => ({
        id: p.id ?? `p${idx + 1}`,
        nama: p.nama ?? p.name ?? 'Unknown',
        profile: p.profile ?? p.avatar ?? p.photo ?? p.foto ?? null,
      }));
      setPegawaiList(mapped);
    } catch (error) {
      console.error('Failed to refresh pegawai list', error);
    }
  };

  const onOpenEmployeeManager = () => setPegawaiModalOpen(true);
  const selectedEmployees = () => pegawaiList().filter((p) => selectedPegawaiIds().includes(p.id));
  const filteredPegawai = () =>
    pegawaiList().filter((p) => !searchPegawai() || p.nama.toLowerCase().includes(searchPegawai().toLowerCase()));

  const handleTogglePegawai = (id) => {
    setSelectedPegawaiIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleClearAllPegawai = () => setSelectedPegawaiIds([]);
  const handleSelectAllPegawai = () => setSelectedPegawaiIds(filteredPegawai().map((p) => p.id));

  createEffect(() => {
    const id = editId();
    if (!id) return;

    (async () => {
      try {
        const data = await getKegiatanAll();
        const item = (data || []).find((k) => Number(k.id) === Number(id));

        if (!item) return;

        setNamaKegiatan(item.nama_kegiatan || '');
        setKategori(String(item.kategori || 'DP'));
        setStatus(mapStatusToForm(item.status));
        setWaktuMulai(toDateTimeLocal(item.waktu_mulai));
        setWaktuSelesai(toDateTimeLocal(item.waktu_selesai));
        setLokasiInput(item.lokasi || '');
        setHasilKegiatanInput(item.output || '');
        setSelectedPegawaiIds((item.pegawai || []).map((p) => p.id));
      } catch (error) {
        console.error('Failed to load kegiatan for edit', error);
      }
    })();
  });

  onMount(async () => {
    await refreshPegawaiList();
  });

  return (
    <>
      <MasterPegawaiModal
        open={pegawaiModalOpen()}
        onClose={() => {
          setPegawaiModalOpen(false);
          const currentQuery = new URLSearchParams(searchParams);
          if (currentQuery.get('openEmployeeManager') === '1') {
            currentQuery.delete('openEmployeeManager');
            navigate(`/kegiatan/baru${currentQuery.toString() ? `?${currentQuery.toString()}` : ''}`, {
              replace: true,
            });
          }
        }}
        pegawaiList={pegawaiList()}
        onRefresh={refreshPegawaiList}
      />

      <PrintPdfModal
        open={printModalOpen()}
        onClose={() => setPrintModalOpen(false)}
        title='Cetak Formulir Kegiatan'
        subtitle='Siapkan formulir kegiatan untuk dicetak atau disimpan dalam format PDF.'
      />

      <div class=':uno: animate-fade-in'>
        {/* Card: Page Header */}
        <div class=':uno: layout-dark relative bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white p-6 rounded-3xl shadow-md'>
          <div class='absolute animate-pulse top-0 right-0 -mt-10 -mr-10 w-30 h-30 bg-orange-500/15 rounded-full blur-2xl pointer-events-none' />
          <div class='absolute animate-pulse bottom-0 left-1/3 -mb-10 w-30 h-30 bg-amber-500/15 rounded-full blur-2xl pointer-events-none' />
          <div class='absolute animate-pulse top-1/2 left-0 w-24 h-24 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none' />

          <div class=':uno: relative space-y-2'>
            <div class=':uno: flex items-center gap-4'>
              <div class=':uno: flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 ring-2 ring-amber-600/20 text-white size-8 rounded-lg'>
                <FiFilePlus stroke-width={1.5} size={18} />
              </div>
              <Badge color='orange' size='md'>
                Input Kegiatan
              </Badge>
            </div>
            <div class=':uno: space-y-1'>
              <h1 class=':uno: font-semibold text-xl text-[var(--title)] md:text-2xl'>Formulir Kegiatan Pegawai</h1>
              <p class=':uno: mt-0.5 text-[11px] text-[var(--text-muted)] leading-4 md:text-sm'>
                Isi data terkait kegiatan yang akan dilaksanakan dan pegawai yang berpartisipasi dalam kegiatan
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div class=':uno: grid grid-cols-1 lg:(grid-cols-12 space-x-4) items-start'>
            <div class=':uno: lg:col-span-7 layout-light grid grid-cols-1 mt-5 gap-5'>
              {/* Card 1: Identitas dan Kategori Pegawai */}
              <div class=':uno: space-y-6 rounded-3xl p-6 bg-[var(--surface)] shadow-md'>
                <CardHeader
                  order={1}
                  title='Identitas & Kategori Kegiatan'
                  description='Isi nama dan kategori kegiatan dinas/tugas pegawai'
                />
                <div class=':uno: space-y-4'>
                  <div>
                    <label for='nama-kegiatan' class=':uno: block mb-1.5 text-xs text-[var(--title)]/80 font-semibold'>
                      Nama/Judul Kegiatan
                    </label>
                    <input
                      type='text'
                      id='nama-kegiatan'
                      value={namaKegiatan()}
                      onInput={(e) => setNamaKegiatan(e.currentTarget.value)}
                      class=':uno: py-2.5 px-3 text-xs text-[var(--text)] w-full bg-slate-50/50 border border-slate-200 rounded-xl focus:(border-primary/80 outline-2 outline-primary/20) transition-colors duration-200'
                      placeholder='Contoh: Rapat Koordinasi Program Kerja'
                    />
                  </div>
                  <div>
                    <label for='cat-dlt' class=':uno: block mb-1.5 text-xs text-[var(--title)]/80 font-semibold'>
                      Kategori
                    </label>
                    <div class=':uno: grid grid-cols-1 sm:grid-cols-2 gap-2'>
                      <For each={KATEGORI_LABEL}>
                        {(cat) => (
                          <button
                            type='button'
                            id={`cat-${cat.key}`}
                            onClick={() => setKategori(cat.label)}
                            classList={{ 'bg-primary/5 border-primary/80': kategori() === cat.label }}
                            class=':uno: relative flex items-center gap-2 py-1 px-3 text-xs text-[var(--text)] w-full bg-slate-50/50 border border-slate-200 rounded-xl focus:(border-primary/80 outline-2 outline-primary/20 bg-primary/5) transition-colors duration-200'
                          >
                            <div class=':uno: block min-w-16'>
                              <KategoriBadge type={cat.label} />
                            </div>
                            <div class=':uno: flex flex-col text-left'>
                              <span class=':uno: font-bold text-[var(--title)] text-xs'>{cat.long}</span>
                              <span class=':uno: text-[10px]'>Kategori {cat.label}</span>
                            </div>
                            <Show when={kategori() === cat.label}>
                              <div class=':uno: absolute top-1 right-1 color-primary'>
                                <FiCheckCircle size={14} stroke-width={2} />
                              </div>
                            </Show>
                          </button>
                        )}
                      </For>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Waktu Kegiatan */}
              <div class=':uno: layout-light space-y-6 rounded-3xl p-6 bg-[var(--surface)] shadow-md'>
                <CardHeader
                  order={2}
                  title='Waktu Pelaksanaan Kegiatan'
                  description='Tentukan waktu mulai serta selesai'
                />
                <div class=':uno: grid md:grid-cols-2 gap-4'>
                  <div class='py-2 px-4 relative bg-gradient-to-br from-emerald-50/70 to-teal-50/40 rounded-2xl border border-emerald-200/80 space-y-2'>
                    <label
                      for='waktu-mulai'
                      class='block text-xs font-black text-emerald-950 uppercase tracking-wide flex items-center justify-between'
                    >
                      Waktu Mulai Kegiatan
                    </label>
                    <input
                      type='datetime-local'
                      id='waktu-mulai'
                      value={waktuMulai()}
                      onInput={(e) => setWaktuMulai(e.currentTarget.value)}
                      class=':uno: py-2.5 px-3 text-xs text-[var(--text)] w-full bg-slate-50/50 border border-emerald-200 rounded-xl focus:(border-emerald-500/80 outline-2 outline-emerald-500/20) transition-colors duration-200'
                    />
                    <p class='text-[10px] text-emerald-700 flex items-center space-x-1'>
                      <FiInfo size={12} stroke-width={1.5} />
                      <span class=':uno: text-[var(--text)]'>Pilih tanggal dan jam dimulainya kegiatan</span>
                    </p>
                  </div>
                  <div class='py-2 px-4 bg-gradient-to-br from-yellow-50/70 to-amber-50/40 rounded-2xl border border-yellow-200/80 space-y-2'>
                    <label
                      for='waktu-selesai'
                      class='block text-xs font-black text-yellow-950 uppercase tracking-wide flex items-center justify-between'
                    >
                      Waktu Selesai Kegiatan
                    </label>
                    <input
                      type='datetime-local'
                      id='waktu-selesai'
                      value={waktuSelesai()}
                      onInput={(e) => setWaktuSelesai(e.currentTarget.value)}
                      class=':uno: py-2.5 px-3 text-xs text-[var(--text)] w-full bg-slate-50/50 border border-yellow-200 rounded-xl focus:(border-yellow-500/80 outline-2 outline-yellow-500/20) transition-colors duration-200'
                    />
                    <p class='text-[10px] text-yellow-700 flex items-center space-x-1'>
                      <FiInfo size={12} stroke-width={1.5} />
                      <span class=':uno: text-[var(--text)]'>Pilih perkiraan tanggal dan jam selesai</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Status Kegiatan */}
              <div class=':uno: layout-light space-y-6 rounded-3xl p-6 bg-[var(--surface)] shadow-md'>
                <CardHeader
                  order={3}
                  title='Status, Lokasi & Output'
                  description='Lokasi pelaksanaan, status, serta kaitan output kegiatan'
                />
                <div class=':uno: space-y-4'>
                  <div>
                    <label for='status-rencana' class=':uno: block mb-1.5 text-xs text-[var(--title)]/80 font-semibold'>
                      Status Kegiatan
                    </label>
                    <div class=':uno: grid grid-cols-2 gap-2'>
                      <For each={STATUS_KEGIATAN}>
                        {(stat) => (
                          <button
                            type='button'
                            id={`status-${stat.key}`}
                            onClick={() => setStatus(stat.key)}
                            classList={{ [stat.active]: status() === stat.key }}
                            class=':uno: font-bold text-[var(--title)] border text-xs rounded-2xl w-full h-12 p-2 border-[var(--border)] bg-slate-50 transition-colors ease-in-out duration-300'
                          >
                            {stat.label}
                          </button>
                        )}
                      </For>
                    </div>
                  </div>
                  <div class=':uno: relative'>
                    <label for='lokasi' class=':uno: block mb-1.5 text-xs text-[var(--title)]/80 font-semibold'>
                      Lokasi Pelaksanaan Kegiatan
                    </label>
                    <div class=':uno: absolute left-3 bottom-3 flex items-center pointer-events-none text-red-600/60'>
                      <FiMapPin size={16} stroke-width={2} />
                    </div>
                    <input
                      type='text'
                      id='lokasi'
                      value={lokasiInput()}
                      onInput={(e) => setLokasiInput(e.currentTarget.value)}
                      class=':uno: py-2.5 pr-4 pl-10 text-xs text-[var(--text)] w-full bg-slate-50/50 border border-slate-200 rounded-xl focus:(border-primary/80 outline-2 outline-primary/20) transition-colors duration-200'
                      placeholder='Contoh: Ruang Rapat Lt.3 Gedung A / Jl. xxx'
                    />
                  </div>
                  <div>
                    <label for='hasil-kegiatan' class=':uno: block mb-1.5 text-xs text-[var(--title)]/80 font-semibold'>
                      Output / Hasil Kegiatan
                    </label>
                    <textarea
                      rows={2}
                      id='hasil-kegiatan'
                      value={hasilKegiatanInput()}
                      onInput={(e) => setHasilKegiatanInput(e.currentTarget.value)}
                      class=':uno: p-3.5 text-xs resize-none leading-3.5 text-[var(--text)] w-full bg-slate-50/50 border border-slate-200 rounded-2xl focus:(border-primary/80 outline-2 outline-primary/20) transition-colors duration-200'
                      placeholder='Tuliskan ringkasan hasil, keluaran dokumen, berita acara, atau capaian penting kegiatan ini...'
                    />
                  </div>
                </div>
              </div>

              {/* Card 4 (mobile): Pegawai - tampil hanya pada layar kecil */}
              <div class=':uno: layout-dark mt-5 lg:hidden space-y-4'>
                <div class=':uno: bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-800 space-y-5 relative overflow-hidden'>
                  {/* Section Header */}
                  <div class=':uno: space-y-3 border-b border-slate-800 pb-4'>
                    <div class=':uno: flex items-center justify-between gap-2'>
                      <div class=':uno: flex items-center space-x-3'>
                        <div class=':uno: w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-orange-500/30 ring-2 ring-orange-500/20'>
                          04
                        </div>
                        <div>
                          <h2 class=':uno: text-sm font-black text-white uppercase tracking-wider flex items-center space-x-1.5'>
                            <span>Pelaksana Kegiatan</span>
                          </h2>
                          <p class=':uno: text-[10px] text-slate-400'>Pilih pegawai pelaksana tugas kegiatan</p>
                        </div>
                      </div>

                      <span class=':uno: px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs rounded-full shadow-lg shadow-orange-500/30 shrink-0'>
                        {selectedPegawaiIds().length} Terpilih
                      </span>
                    </div>

                    {onOpenEmployeeManager && (
                      <div class=':uno: pt-1 flex items-center justify-between'>
                        <button
                          type='button'
                          onClick={onOpenEmployeeManager}
                          class=':uno: text-xs text-amber-400 hover:text-amber-300 font-extrabold underline transition-colors cursor-pointer flex items-center space-x-1.5'
                        >
                          <FiUserPlus class=':uno: w-3.5 h-3.5 text-orange-400' />
                          <span>Kelola / Tambah Master Pegawai</span>
                        </button>
                        <span class=':uno: text-[10px] text-slate-500'>Total: {pegawaiList().length} Org</span>
                      </div>
                    )}
                  </div>

                  {/* Selected Employee Avatar Chips Tray */}
                  {selectedEmployees().length > 0 && (
                    <div class=':uno: p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2'>
                      <div class=':uno: flex items-center justify-between text-[11px] text-slate-300 font-extrabold'>
                        <span class=':uno: flex items-center space-x-1 text-amber-300'>
                          <FiUsers class=':uno: w-3.5 h-3.5' />
                          <span>Anggota Tim Terpilih ({selectedEmployees().length})</span>
                        </span>
                        <button
                          type='button'
                          onClick={handleClearAllPegawai}
                          class=':uno: text-[10px] text-rose-400 hover:underline font-bold cursor-pointer'
                        >
                          Kosongkan Semua
                        </button>
                      </div>

                      <div class=':uno: flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 scrollbar-thin'>
                        {selectedEmployees().map((emp) => (
                          <span
                            key={emp.id}
                            class=':uno: inline-flex items-center space-x-1.5 px-2.5 py-1 bg-gradient-to-r from-orange-950 to-amber-950 text-amber-200 border border-orange-500/50 rounded-xl text-[11px] font-bold shadow-2xs'
                          >
                            <span class=':uno: w-4 h-4 rounded-full overflow-hidden bg-orange-500 text-white text-[9px] font-black flex items-center justify-center'>
                              {emp.profile ? (
                                <img src={emp.profile} alt={emp.nama} class='w-full h-full object-cover' />
                              ) : (
                                emp.nama.charAt(0)
                              )}
                            </span>
                            <span class=':uno: truncate max-w-[120px]'>{emp.nama}</span>
                            <button
                              type='button'
                              onClick={() => handleTogglePegawai(emp.id)}
                              class=':uno: hover:text-rose-400 cursor-pointer ml-0.5'
                              title='Hapus dari daftar'
                            >
                              <FiX class=':uno: w-3 h-3' />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search & Division Filter Controls */}
                  <div class=':uno: space-y-2.5'>
                    {/* Search Box */}
                    <div class=':uno: relative'>
                      <FiSearch class=':uno: w-4 h-4 text-slate-400 absolute left-3.5 top-3' />
                      <input
                        type='text'
                        value={searchPegawai()}
                        onInput={(e) => setSearchPegawai(e.currentTarget.value)}
                        placeholder='Cari nama pegawai, NIP, atau jabatan...'
                        class=':uno: w-full pl-10 pr-8 py-2.5 text-xs bg-slate-800/90 border border-slate-700/80 rounded-2xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-medium'
                      />
                      {searchPegawai() && (
                        <button
                          type='button'
                          onClick={() => setSearchPegawai('')}
                          class=':uno: absolute right-3 top-3 text-slate-400 hover:text-white'
                        >
                          <FiX class=':uno: w-3.5 h-3.5' />
                        </button>
                      )}
                    </div>

                    {/* Quick Select All Toolbar */}
                    <div class=':uno: flex items-center justify-between gap-2 pt-1 text-xs border-t border-slate-800/80'>
                      <span class=':uno: text-[11px] text-slate-400 font-medium'>
                        Menampilkan <strong class=':uno: text-amber-400'>{filteredPegawai().length}</strong> pegawai
                      </span>

                      <div class=':uno: flex items-center space-x-2'>
                        <button
                          type='button'
                          onClick={handleSelectAllPegawai}
                          class=':uno: px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-[11px] font-bold transition-colors flex items-center space-x-1 cursor-pointer'
                        >
                          <FiCheckSquare class=':uno: w-3.5 h-3.5' />
                          <span>Pilih Semua</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Checkbox List for Employees with Avatar & Badges */}
                  <div class=':uno: max-h-[380px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900'>
                    {filteredPegawai().length === 0 ? (
                      <div class=':uno: py-12 text-center text-xs text-slate-400 bg-slate-800/40 rounded-2xl border border-slate-800/80 px-4 space-y-2'>
                        <FiUsers class=':uno: w-8 h-8 text-slate-600 mx-auto' />
                        <p class=':uno: font-bold text-slate-300'>Pegawai Tidak Ditemukan</p>
                        <p class=':uno: text-[11px]'>Coba ubah kata kunci pencarian atau filter divisi.</p>
                      </div>
                    ) : (
                      filteredPegawai().map((peg, idx) => {
                        const isChecked = selectedPegawaiIds().includes(peg.id);
                        // Avatar background gradients
                        const bgGradients = [
                          'from-amber-500 to-orange-500',
                          'from-emerald-500 to-teal-500',
                          'from-blue-500 to-indigo-500',
                          'from-purple-500 to-pink-500',
                          'from-rose-500 to-orange-500',
                        ];
                        const gradient = bgGradients[idx % bgGradients.length];

                        return (
                          <label
                            key={peg.id}
                            class={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-gradient-to-r from-orange-950/70 via-slate-900 to-amber-950/50 border-orange-500/80 ring-1 ring-orange-500/50 shadow-md'
                                : 'bg-slate-800/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/90'
                            }`}
                          >
                            <div class=':uno: flex items-center space-x-3 overflow-hidden select-none pr-2'>
                              <input
                                type='checkbox'
                                checked={isChecked}
                                onChange={() => handleTogglePegawai(peg.id)}
                                class=':uno: h-4 w-4 text-orange-500 rounded border-slate-600 bg-slate-900 focus:ring-orange-500 accent-orange-500 shrink-0 cursor-pointer'
                              />

                              <div
                                class={`w-9 h-9 rounded-xl overflow-hidden ${peg.profile ? '' : `bg-gradient-to-tr ${gradient} text-white font-extrabold text-xs`} flex items-center justify-center shrink-0 shadow-md`}
                              >
                                {peg.profile ? (
                                  <img src={peg.profile} alt={peg.nama} class='w-full h-full object-cover' />
                                ) : (
                                  peg.nama.charAt(0)
                                )}
                              </div>

                              <div class=':uno: min-w-0'>
                                <span
                                  class={`text-xs font-bold block truncate ${isChecked ? 'text-amber-300' : 'text-slate-100'}`}
                                >
                                  {peg.nama}
                                </span>
                              </div>
                            </div>

                            <div class=':uno: shrink-0 pl-2'>
                              {isChecked ? (
                                <span class=':uno: inline-flex items-center space-x-1 bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow-xs'>
                                  <FiCheck class=':uno: w-3 h-3' />
                                  <span>Terpilih</span>
                                </span>
                              ) : (
                                <span class=':uno: text-[10px] text-slate-500 border border-slate-700 px-2 py-0.5 rounded-lg'>
                                  Belum
                                </span>
                              )}
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>

                  {/* Selection Summary Footer */}
                  <div class=':uno: pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400'>
                    <span>Total Pelaksana Kegiatan:</span>
                    <span class=':uno: font-black text-amber-400 text-sm bg-slate-800 px-3 py-1 rounded-xl border border-slate-700'>
                      {selectedPegawaiIds().length} Orang
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 5: Save */}
              <div class=':uno: layout-light rounded-3xl flex flex-wrap md:flex-nowrap gap-2 md:grid-cols-2 bg-[var(--surface)] p-6 shadow-md'>
                <button
                  type='button'
                  onClick={handleResetForm}
                  class=':uno: flex items-center w-full justify-center font-bold rounded-full text-slate-700 gap-2 px-4 py-3 text-xs bg-[var(--surface-alt)]'
                >
                  <FiRotateCcw size={16} stroke-width={2} />
                  Reset Formulir
                </button>
                <button
                  type='button'
                  onClick={() => setPrintModalOpen(true)}
                  class=':uno: flex items-center w-full justify-center font-bold rounded-full text-white gap-2 px-4 py-3 text-xs bg-slate-800 shadow-md shadow-slate-500/20'
                >
                  <FiPrinter size={16} stroke-width={2} />
                  Cetak PDF
                </button>
                <button
                  type='submit'
                  class=':uno: flex items-center w-full justify-center font-bold rounded-full text-orange-50 gap-2 px-4 py-3 text-xs bg-primary/80 shadow-md shadow-orange-500/35'
                >
                  <FiSave size={16} stroke-width={2} />
                  Simpan Data Kegiatan
                </button>
              </div>
            </div>

            {/* Card 4: Pegawai */}
            <div class=':uno: layout-dark mt-5 lg:(col-span-5 sticky z-5 top-30) space-y-4 hidden lg:block'>
              <div class=':uno: bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-800 space-y-5 relative overflow-hidden'>
                {/* Section Header */}
                <div class=':uno: space-y-3 border-b border-slate-800 pb-4'>
                  <div class=':uno: flex items-center justify-between gap-2'>
                    <div class=':uno: flex items-center space-x-3'>
                      <div class=':uno: w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-orange-500/30 ring-2 ring-orange-500/20'>
                        04
                      </div>
                      <div>
                        <h2 class=':uno: text-sm font-black text-white uppercase tracking-wider flex items-center space-x-1.5'>
                          <span>Pelaksana Kegiatan</span>
                        </h2>
                        <p class=':uno: text-[10px] text-slate-400'>Pilih pegawai pelaksana tugas kegiatan</p>
                      </div>
                    </div>

                    <span class=':uno: px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs rounded-full shadow-lg shadow-orange-500/30 shrink-0'>
                      {selectedPegawaiIds().length} Terpilih
                    </span>
                  </div>

                  {onOpenEmployeeManager && (
                    <div class=':uno: pt-1 flex items-center justify-between'>
                      <button
                        type='button'
                        onClick={onOpenEmployeeManager}
                        class=':uno: text-xs text-amber-400 hover:text-amber-300 font-extrabold underline transition-colors cursor-pointer flex items-center space-x-1.5'
                      >
                        <FiUserPlus class=':uno: w-3.5 h-3.5 text-orange-400' />
                        <span>Kelola / Tambah Master Pegawai</span>
                      </button>
                      <span class=':uno: text-[10px] text-slate-500'>Total: {pegawaiList().length} Org</span>
                    </div>
                  )}
                </div>

                {/* Selected Employee Avatar Chips Tray */}
                {selectedEmployees().length > 0 && (
                  <div class=':uno: p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2'>
                    <div class=':uno: flex items-center justify-between text-[11px] text-slate-300 font-extrabold'>
                      <span class=':uno: flex items-center space-x-1 text-amber-300'>
                        <FiUsers class=':uno: w-3.5 h-3.5' />
                        <span>Anggota Tim Terpilih ({selectedEmployees().length})</span>
                      </span>
                      <button
                        type='button'
                        onClick={handleClearAllPegawai}
                        class=':uno: text-[10px] text-rose-400 hover:underline font-bold cursor-pointer'
                      >
                        Kosongkan Semua
                      </button>
                    </div>

                    <div class=':uno: flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 scrollbar-thin'>
                      {selectedEmployees().map((emp) => (
                        <span
                          key={emp.id}
                          class=':uno: inline-flex items-center space-x-1.5 px-2.5 py-1 bg-gradient-to-r from-orange-950 to-amber-950 text-amber-200 border border-orange-500/50 rounded-xl text-[11px] font-bold shadow-2xs'
                        >
                          <span class=':uno: w-4 h-4 rounded-full overflow-hidden bg-orange-500 text-white text-[9px] font-black flex items-center justify-center'>
                            {emp.profile ? (
                              <img src={emp.profile} alt={emp.nama} class='w-full h-full object-cover' />
                            ) : (
                              emp.nama.charAt(0)
                            )}
                          </span>
                          <span class=':uno: truncate max-w-[120px]'>{emp.nama}</span>
                          <button
                            type='button'
                            onClick={() => handleTogglePegawai(emp.id)}
                            class=':uno: hover:text-rose-400 cursor-pointer ml-0.5'
                            title='Hapus dari daftar'
                          >
                            <FiX class=':uno: w-3 h-3' />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search & Division Filter Controls */}
                <div class=':uno: space-y-2.5'>
                  {/* Search Box */}
                  <div class=':uno: relative'>
                    <FiSearch class=':uno: w-4 h-4 text-slate-400 absolute left-3.5 top-3' />
                    <input
                      type='text'
                      value={searchPegawai()}
                      onInput={(e) => setSearchPegawai(e.currentTarget.value)}
                      placeholder='Cari nama pegawai, NIP, atau jabatan...'
                      class=':uno: w-full pl-10 pr-8 py-2.5 text-xs bg-slate-800/90 border border-slate-700/80 rounded-2xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-medium'
                    />
                    {searchPegawai() && (
                      <button
                        type='button'
                        onClick={() => setSearchPegawai('')}
                        class=':uno: absolute right-3 top-3 text-slate-400 hover:text-white'
                      >
                        <FiX class=':uno: w-3.5 h-3.5' />
                      </button>
                    )}
                  </div>

                  {/* Quick Select All Toolbar */}
                  <div class=':uno: flex items-center justify-between gap-2 pt-1 text-xs border-t border-slate-800/80'>
                    <span class=':uno: text-[11px] text-slate-400 font-medium'>
                      Menampilkan <strong class=':uno: text-amber-400'>{filteredPegawai().length}</strong> pegawai
                    </span>

                    <div class=':uno: flex items-center space-x-2'>
                      <button
                        type='button'
                        onClick={handleSelectAllPegawai}
                        class=':uno: px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-[11px] font-bold transition-colors flex items-center space-x-1 cursor-pointer'
                      >
                        <FiCheckSquare class=':uno: w-3.5 h-3.5' />
                        <span>Pilih Hasil ({filteredPegawai().length})</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Checkbox List for Employees with Avatar & Badges */}
                <div class=':uno: max-h-[380px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900'>
                  {filteredPegawai().length === 0 ? (
                    <div class=':uno: py-12 text-center text-xs text-slate-400 bg-slate-800/40 rounded-2xl border border-slate-800/80 px-4 space-y-2'>
                      <FiUsers class=':uno: w-8 h-8 text-slate-600 mx-auto' />
                      <p class=':uno: font-bold text-slate-300'>Pegawai Tidak Ditemukan</p>
                      <p class=':uno: text-[11px]'>Coba ubah kata kunci pencarian atau filter divisi.</p>
                    </div>
                  ) : (
                    filteredPegawai().map((peg, idx) => {
                      const isChecked = selectedPegawaiIds().includes(peg.id);
                      // Avatar background gradients
                      const bgGradients = [
                        'from-amber-500 to-orange-500',
                        'from-emerald-500 to-teal-500',
                        'from-blue-500 to-indigo-500',
                        'from-purple-500 to-pink-500',
                        'from-rose-500 to-orange-500',
                      ];
                      const gradient = bgGradients[idx % bgGradients.length];

                      return (
                        <label
                          key={peg.id}
                          class={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-gradient-to-r from-orange-950/70 via-slate-900 to-amber-950/50 border-orange-500/80 ring-1 ring-orange-500/50 shadow-md'
                              : 'bg-slate-800/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/90'
                          }`}
                        >
                          <div class=':uno: flex items-center space-x-3 overflow-hidden select-none pr-2'>
                            <input
                              type='checkbox'
                              checked={isChecked}
                              onChange={() => handleTogglePegawai(peg.id)}
                              class=':uno: h-4 w-4 text-orange-500 rounded border-slate-600 bg-slate-900 focus:ring-orange-500 accent-orange-500 shrink-0 cursor-pointer'
                            />

                            <div
                              class={`w-9 h-9 rounded-xl overflow-hidden ${peg.profile ? '' : `bg-gradient-to-tr ${gradient} text-white font-extrabold text-xs`} flex items-center justify-center shrink-0 shadow-md`}
                            >
                              {peg.profile ? (
                                <img src={peg.profile} alt={peg.nama} class='w-full h-full object-cover' />
                              ) : (
                                peg.nama.charAt(0)
                              )}
                            </div>

                            <div class=':uno: min-w-0'>
                              <span
                                class={`text-xs font-bold block truncate ${isChecked ? 'text-amber-300' : 'text-slate-100'}`}
                              >
                                {peg.nama}
                              </span>
                              <div class=':uno: flex items-center space-x-1.5 text-[10px] text-slate-400 mt-0.5'></div>
                            </div>
                          </div>

                          <div class=':uno: shrink-0 pl-2'>
                            {isChecked ? (
                              <span class=':uno: inline-flex items-center space-x-1 bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow-xs'>
                                <FiCheck class=':uno: w-3 h-3' />
                                <span>Terpilih</span>
                              </span>
                            ) : (
                              <span class=':uno: text-[10px] text-slate-500 border border-slate-700 px-2 py-0.5 rounded-lg'>
                                + Pilih
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>

                {/* Selection Summary Footer */}
                <div class=':uno: pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400'>
                  <span>Total Pelaksana Kegiatan:</span>
                  <span class=':uno: font-black text-amber-400 text-sm bg-slate-800 px-3 py-1 rounded-xl border border-slate-700'>
                    {selectedPegawaiIds().length} Orang
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
