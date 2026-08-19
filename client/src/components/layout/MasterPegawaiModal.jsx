import { For, Show, createSignal } from 'solid-js';
import { FiX, FiUsers, FiPlus, FiSearch, FiShield, FiTrash2, FiEdit3 } from 'solid-icons/fi';

import { createPegawai, updatePegawai, deletePegawai } from '../../services/pegawai.js';

export default function MasterPegawaiModal(props) {
  const [search, setSearch] = createSignal('');
  const [nama, setNama] = createSignal('');
  const [editingId, setEditingId] = createSignal(null);
  const [submitting, setSubmitting] = createSignal(false);

  const visiblePegawai = () => {
    const list = Array.isArray(props.pegawaiList) ? props.pegawaiList : [];
    const query = search().trim().toLowerCase();

    if (!query) return list;

    return list.filter((pegawai) => (pegawai.nama || '').toLowerCase().includes(query));
  };

  const resetForm = () => {
    setNama('');
    setEditingId(null);
  };

  const handleSubmit = async () => {
    const value = nama().trim();
    if (!value) {
      alert('Nama pegawai wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);

      if (editingId()) {
        await updatePegawai(editingId(), { nama: value });
      } else {
        await createPegawai({ nama: value });
      }

      resetForm();
      await props.onRefresh?.();
    } catch (error) {
      alert(error.message || 'Gagal menyimpan pegawai.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (pegawai) => {
    setEditingId(pegawai.id);
    setNama(pegawai.nama || '');
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Apakah Anda yakin ingin menghapus pegawai ini?');
    if (!confirmed) return;

    try {
      await deletePegawai(id);
      if (editingId() === id) {
        resetForm();
      }
      await props.onRefresh?.();
    } catch (error) {
      alert(error.message || 'Gagal menghapus pegawai.');
    }
  };

  return (
    <Show when={props.open}>
      <div
        class=':uno: fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm'
        onClick={props.onClose}
      >
        <div
          class=':uno: layout-light relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20'
          onClick={(e) => e.stopPropagation()}
        >
          <div class=':uno: flex items-start justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-orange-900 px-6 py-5 text-white'>
            <div class=':uno: pr-4'>
              <div class=':uno: mb-2 flex items-center gap-2'>
                <span class=':uno: inline-flex items-center rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white'>
                  Master Data
                </span>
              </div>

              <h3 class=':uno: text-xl font-bold text-white leading-snug'>Data Pegawai</h3>
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

          <div class=':uno: space-y-5 overflow-y-auto p-6'>
            <div class=':uno: grid gap-3 md:grid-cols-[1fr_auto]'>
              <div>
                <label class=':uno: mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500'>
                  Nama Pegawai
                </label>
                <input
                  type='text'
                  value={nama()}
                  onInput={(e) => setNama(e.currentTarget.value)}
                  placeholder='Contoh: Siti Aisyah'
                  class=':uno: w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 focus:(border-primary/80 outline-2 outline-primary/20)'
                />
              </div>

              <div class=':uno: flex items-end'>
                <button
                  type='button'
                  onClick={handleSubmit}
                  disabled={submitting()}
                  class=':uno: inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-[11px] font-black text-white shadow-md shadow-orange-500/30 disabled:opacity-60'
                >
                  <FiPlus size={14} />
                  {submitting() ? 'Menyimpan...' : editingId() ? 'Simpan Perubahan' : 'Tambah'}
                </button>
              </div>
            </div>

            <div class=':uno: rounded-2xl border border-slate-200 bg-slate-50 p-3'>
              <div class=':uno: relative'>
                <span class=':uno: absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400'>
                  <FiSearch class='w-4 h-4' />
                </span>
                <input
                  type='text'
                  value={search()}
                  onInput={(e) => setSearch(e.currentTarget.value)}
                  placeholder='Cari nama pegawai...'
                  class=':uno: w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-xs text-slate-800 focus:(border-primary/80 outline-2 outline-primary/20)'
                />
              </div>
            </div>

            <div>
              <div class=':uno: mb-2 flex items-center justify-between'>
                <h4 class=':uno: flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500'>
                  <FiUsers size={14} class='text-orange-500' />
                  Daftar Pegawai
                </h4>
                <span class=':uno: text-[10px] font-bold text-slate-500'>Total: {visiblePegawai().length}</span>
              </div>

              <Show
                when={visiblePegawai().length > 0}
                fallback={
                  <p class=':uno: rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs italic text-slate-400'>
                    Belum ada data pegawai yang cocok.
                  </p>
                }
              >
                <div class=':uno: grid gap-2 sm:grid-cols-2'>
                  <For each={visiblePegawai()}>
                    {(pegawai) => (
                      <div class=':uno: flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm'>
                        <div class=':uno: flex min-w-0 items-center gap-3'>
                          <div class=':uno: flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-xs font-black text-white'>
                            {(pegawai.nama || 'P').charAt(0).toUpperCase()}
                          </div>

                          <div class=':uno: min-w-0'>
                            <p class=':uno: truncate text-xs font-bold text-slate-900'>{pegawai.nama || 'Pegawai'}</p>
                          </div>
                        </div>

                        <div class=':uno: flex items-center gap-1.5'>
                          <button
                            type='button'
                            onClick={() => handleEdit(pegawai)}
                            class=':uno: inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 transition-colors hover:bg-amber-100'
                            title='Edit pegawai'
                          >
                            <FiEdit3 size={11} />
                            Ubah
                          </button>

                          <button
                            type='button'
                            onClick={() => handleDelete(pegawai.id)}
                            class=':uno: inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700 transition-colors hover:bg-rose-100'
                            title='Hapus pegawai'
                          >
                            <FiTrash2 size={11} />
                            Hapus
                          </button>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          </div>

          <div class=':uno: flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4'>
            <div class=':uno: flex items-center gap-2 text-[11px] text-slate-500'>
              <FiShield size={12} class='text-orange-500' />
              Data terhubung ke master pegawai sistem.
            </div>

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
    </Show>
  );
}
