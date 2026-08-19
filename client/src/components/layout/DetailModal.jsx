import { For, Show } from 'solid-js';
import { FiX, FiCalendar, FiClock, FiMapPin, FiUsers, FiAward, FiEdit3, FiTrash2 } from 'solid-icons/fi';

import { StatusLabel } from '../common/StatusLabel';
import { KategoriBadge } from '../common/KategoriBadge';

const CATEGORY_MAP = {
  DLT: { label: 'DLT', long: 'Dinas Luar Tim' },
  TN: { label: 'TN', long: 'Tugas Narsum' },
  DP: { label: 'DP', long: 'Dalam Penugasan' },
  DLK: { label: 'DLK', long: 'Dinas Luar Kegiatan' },
};

const normalizeCategory = (value) => {
  const key = String(value || '').toUpperCase();
  return CATEGORY_MAP[key] || { label: key || 'LAIN', long: 'Lainnya' };
};

const normalizeStatus = (value) => {
  const key = String(value || '').trim();
  const map = {
    terjadwal: 'Terjadwal',
    rencana: 'Rencana',
    berlangsung: 'Berlangsung',
    selesai: 'Selesai',
    dibatalkan: 'Dibatalkan',
  };

  return map[key.toLowerCase()] || key || 'Rencana';
};

const formatDate = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function DetailModal(props) {
  const kegiatan = () => props.kegiatan;
  const category = () => normalizeCategory(kegiatan()?.kategori);
  const statusLabel = () => normalizeStatus(kegiatan()?.status);

  const assignedPegawai = () => {
    if (Array.isArray(props.pegawaiList) && props.pegawaiList.length > 0) {
      const ids = new Set((kegiatan()?.pegawai || []).map((p) => p.id));
      return props.pegawaiList.filter((p) => ids.has(p.id));
    }

    return kegiatan()?.pegawai || [];
  };

  return (
    <Show when={kegiatan()}>
      <div
        class=':uno: fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm'
        onClick={props.onClose}
      >
        <div
          class=':uno: layout-light relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20'
          onClick={(e) => e.stopPropagation()}
        >
          <div class=':uno: flex items-start justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-orange-900 px-6 py-5 text-white'>
            <div class=':uno: pr-4'>
              <div class=':uno: mb-2 flex flex-wrap items-center gap-2'>
                <span class=':uno: inline-flex items-center rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white'>
                  {category().label} • {category().long}
                </span>
                <StatusLabel label={statusLabel()} />
              </div>

              <h3 class=':uno: text-xl font-bold text-white leading-snug'>
                {kegiatan()?.nama_kegiatan || 'Judul kegiatan'}
              </h3>
            </div>

            <button
              type='button'
              class=':uno: rounded-xl p-1.5 text-white transition-colors hover:bg-white/10'
              onClick={props.onClose}
              aria-label='Tutup modal'
            >
              <FiX size={18} />
            </button>
          </div>

          <div class=':uno: space-y-6 overflow-y-auto p-6'>
            <div class=':uno: grid grid-cols-1 gap-4 rounded-2xl border border-orange-100 bg-orange-50/50 p-4 sm:grid-cols-2'>
              <div class=':uno: flex items-start gap-3'>
                <div class=':uno: flex size-9 items-center justify-center rounded-xl bg-orange-100 text-orange-700'>
                  <FiCalendar size={16} />
                </div>
                <div>
                  <span class=':uno: block text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500'>
                    Waktu Mulai
                  </span>
                  <span class=':uno: mt-1 block text-sm font-bold text-slate-900'>
                    {formatDate(kegiatan()?.waktu_mulai)}
                  </span>
                  <span class=':uno: mt-0.5 block text-xs font-semibold text-orange-700'>
                    Pukul {formatTime(kegiatan()?.waktu_mulai)} WIB
                  </span>
                </div>
              </div>

              <div class=':uno: flex items-start gap-3'>
                <div class=':uno: flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700'>
                  <FiClock size={16} />
                </div>
                <div>
                  <span class=':uno: block text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500'>
                    Waktu Selesai
                  </span>
                  <span class=':uno: mt-1 block text-sm font-bold text-slate-900'>
                    {formatDate(kegiatan()?.waktu_selesai)}
                  </span>
                  <span class=':uno: mt-0.5 block text-xs font-semibold text-amber-700'>
                    Pukul {formatTime(kegiatan()?.waktu_selesai)} WIB
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 class=':uno: mb-2 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500'>
                <FiMapPin size={14} class='text-orange-500' />
                Lokasi Kegiatan
              </h4>
              <div class=':uno: rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800'>
                {kegiatan()?.lokasi || 'Tidak ditentukan'}
              </div>
            </div>

            <div>
              <h4 class=':uno: mb-2 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500'>
                <span class=':uno: flex items-center gap-2'>
                  <FiUsers size={14} class='text-orange-500' />
                  Pegawai Peserta ({assignedPegawai().length} Orang)
                </span>
              </h4>

              <Show
                when={assignedPegawai().length > 0}
                fallback={<p class=':uno: text-xs italic text-slate-400'>Belum ada pegawai yang ditambahkan.</p>}
              >
                <div class=':uno: grid grid-cols-1 gap-2 sm:grid-cols-2'>
                  <For each={assignedPegawai()}>
                    {(pegawai) => (
                      <div class=':uno: flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm'>
                        <div class=':uno: flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-black text-white'>
                          {(pegawai.nama || 'P').charAt(0).toUpperCase()}
                        </div>

                        <div class=':uno: min-w-0'>
                          <p class=':uno: truncate text-xs font-bold text-slate-900'>{pegawai.nama || 'Pegawai'}</p>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </div>

            <div>
              <h4 class=':uno: mb-2 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500'>
                <FiAward size={14} class='text-orange-500' />
                Output Hasil Kegiatan
              </h4>
              <div class=':uno: whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed font-medium text-slate-700'>
                {kegiatan()?.output || 'Belum ada catatan output hasil kegiatan.'}
              </div>
            </div>
          </div>

          <div class=':uno: flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4'>
            <div class=':uno: text-[11px] text-slate-400'>
              ID: <span class=':uno: font-mono text-slate-600'>{kegiatan()?.id}</span>
            </div>

            <div class=':uno: flex items-center gap-2'>
              <Show when={props.isAdmin && props.onDelete}>
                <button
                  type='button'
                  class=':uno: inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-700 transition-colors hover:bg-rose-100'
                  onClick={() => props.onDelete(kegiatan().id)}
                >
                  <FiTrash2 size={13} />
                  Hapus
                </button>
              </Show>

              <Show when={props.isAdmin && props.onEdit}>
                <button
                  type='button'
                  class=':uno: inline-flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-100 px-3 py-1.5 text-[11px] font-bold text-orange-800 transition-colors hover:bg-orange-200'
                  onClick={() => props.onEdit(kegiatan())}
                >
                  <FiEdit3 size={13} />
                  Edit Data
                </button>
              </Show>

              <button
                type='button'
                class=':uno: rounded-lg bg-slate-800 px-4 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-slate-900'
                onClick={props.onClose}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
