import { A, useNavigate } from '@solidjs/router';
import { createSignal, onMount } from 'solid-js';
import {
  FiShield,
  FiBell,
  FiCheckCircle,
  FiPrinter,
  FiUsers,
  FiCompass,
  FiHome,
  FiChevronRight,
  FiList,
  FiFilePlus,
  FiUser,
  FiLogOut,
  FiUserCheck,
  FiCalendar,
} from 'solid-icons/fi';

import { logout } from '../../services/auth.js';
import { getCurrentUser } from '../../services/auth.js';
import { getPegawai } from '../../services/pegawai.js';
import { getSidebarStats } from '../../services/dashboard.js';

import { sidebar, closeSidebar } from '../../stores/sidebar-store';
import { Badge } from '../ui/Badge';
import PrintPdfModal from './PrintPdfModal';

import brandIcon from '../../assets/icon.svg';

export default function Sidebar() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = createSignal(null);
  const [pegawaiList, setPegawaiList] = createSignal([]);
  const [pegawaiCount, setPegawaiCount] = createSignal(null);
  const [bulanCount, setBulanCount] = createSignal(null);
  const [pegawaiAktif, setPegawaiAktif] = createSignal(null);
  const [pegawaiModalOpen, setPegawaiModalOpen] = createSignal(false);
  const [printModalOpen, setPrintModalOpen] = createSignal(false);

  const handleLogout = async () => {
    const success = await logout();

    if (success) {
      navigate('/login', { replace: true });
    }
  };

  const refreshPegawaiList = async () => {
    try {
      const list = await getPegawai();
      setPegawaiList(Array.isArray(list) ? list : []);
      setPegawaiCount(Array.isArray(list) ? list.length : 0);
    } catch (error) {
      console.error('Failed refreshing pegawai count', error);
    }
  };

  onMount(async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      console.error(err);
    }
    try {
      const list = await getPegawai();
      setPegawaiList(Array.isArray(list) ? list : []);
      setPegawaiCount(Array.isArray(list) ? list.length : 0);
    } catch (err) {
      console.error('Failed fetching pegawai count', err);
      setPegawaiList([]);
      setPegawaiCount(0);
    }
    try {
      const stats = await getSidebarStats();
      setBulanCount(stats.bulanIni ?? 0);
      setPegawaiAktif(stats.pegawaiAktif ?? 0);
    } catch (err) {
      console.error('Failed fetching sidebar stats', err);
      setBulanCount(0);
      setPegawaiAktif(0);
    }
  });

  return (
    <>
      <PrintPdfModal
        open={printModalOpen()}
        onClose={() => setPrintModalOpen(false)}
        title='Cetak Laporan PDF'
        subtitle='Dokumen laporan kegiatan pegawai siap diunduh atau dicetak dalam format PDF.'
      />

      <aside
        classList={{
          ':uno: translate-x-0': sidebar.isOpen,
          ':uno: -translate-x-full md:translate-x-0': !sidebar.isOpen,
        }}
        class=':uno: layout-dark backdrop-blur-[2px] bg-[var(--surface)]/95 fixed flex flex-col h-full w-64 2xl:w-85 z-20 overflow-y-auto overscroll-contain transition-all ease-in-out duration-200'
      >
        <header class=':uno: sticky top-0 bg-[var(--surface)] flex items-center justify-between p-5 border-b border-[var(--border)]'>
          <div aria-label='Kegiatan Pegawai BPMPTP Icon' class=':uno: flex items-center gap-3'>
            <img
              src={brandIcon}
              width={16}
              height={16}
              alt=''
              aria-hidden='true'
              class=':uno: rounded-lg shadow-sm shadow-primary size-9 p-1'
            />
            <div>
              <p aria-hidden='true' class=':uno: font-black text-sm tracking-wide text-[var(--title)]'>
                Kegiatan
              </p>
              <p aria-hidden='true' class=':uno: font-bold text-xs/3 text-[var(--title)]'>
                Pegawai BPMPTP
              </p>
            </div>
          </div>
          <Badge color='green'>{currentUser() && <span>{currentUser().role}</span>}</Badge>
        </header>

        <div class=':uno: mt-5 flex-1 space-y-6'>
          <div class=':uno: flex mx-2 gap-3 xl:gap-4 justify-between items-center'>
            <div class=':uno: group w-full p-2 bg-[var(--surface-alt)]/30 rounded-2xl border border-slate-800 flex items-center space-x-2.5 hover:bg-[var(--surface-alt)]/50'>
              <div class=':uno: shrink-0 size-6 group-hover:(ring ring-orange-600/50 text-orange-500) transition-all duration-200 ease-in rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center'>
                <FiCalendar size={16} stroke-width={1} />
              </div>
              <div>
                <span class=':uno: text-[9px] text-[var(--text-muted)] font-medium block'>Bulan Ini</span>
                <span class=':uno: text-[11px] font-extrabold text-[var(--title)]'>
                  {bulanCount() !== null ? `${bulanCount()} Entry` : '...'}
                </span>
              </div>
            </div>

            <div class=':uno: group w-full p-2 bg-[var(--surface-alt)]/30 rounded-2xl border border-slate-800 flex items-center space-x-2.5 hover:bg-[var(--surface-alt)]/50'>
              <div class=':uno: shrink-0 size-6 group-hover:(ring ring-amber-600/50 text-amber-500) transition-all duration-200 ease-in rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center'>
                <FiUserCheck size={16} stroke-width={1} />
              </div>
              <div>
                <span class=':uno: text-[9px] text-[var(--text-muted)] font-medium block'>Pegawai Aktif</span>
                <span class=':uno: text-[11px] font-extrabold text-[var(--title)]'>
                  {pegawaiAktif() !== null ? `${pegawaiAktif()} Staff` : '...'}
                </span>
              </div>
            </div>
          </div>

          <nav class=':uno: px-2'>
            <div class=':uno: mx-3 space-y-2'>
              <Badge color='rose'>
                <FiCompass size={10} stroke-width={1.5} /> NAVIGASI
              </Badge>

              <ul class=':uno: flex flex-col space-y-1'>
                <li>
                  <A
                    href='/'
                    class=':uno: flex items-center gap-3 px-3 py-2.5 text-sm font-bold rounded-2xl transition-all ease-out duration-400'
                    activeClass=':uno: text-orange-100 bg-gradient-to-r from-rose-800 via-primary to-secondary shadow-xl shadow-primary/20'
                    inactiveClass=':uno: text-[var(--text-muted)]'
                    end={true}
                    onClick={closeSidebar}
                  >
                    <FiHome size={18} stroke-width={1.5} /> Dashboard
                    <div class=':uno: ml-auto'>
                      <FiChevronRight size={16} stroke-width={1.5} />
                    </div>
                  </A>
                </li>
                <li>
                  <A
                    href='/kegiatan'
                    class=':uno: flex items-center gap-3 px-3 py-2.5 text-sm font-bold rounded-2xl transition-all ease-out duration-400'
                    activeClass=':uno: text-orange-100 bg-gradient-to-r from-rose-600 via-primary to-secondary shadow-xl shadow-primary/20'
                    inactiveClass=':uno: text-[var(--text-muted)]'
                    end={true}
                    onClick={closeSidebar}
                  >
                    <FiList size={18} stroke-width={1.5} /> Aktivitas
                    <div class=':uno: ml-auto'>
                      <FiChevronRight size={16} stroke-width={1.5} />
                    </div>
                  </A>
                </li>
                <li>
                  <A
                    href='/kegiatan/baru'
                    class=':uno: flex items-center gap-3 px-3 py-2.5 text-sm font-bold rounded-2xl transition-all ease-out duration-400'
                    activeClass=':uno: text-orange-100 bg-gradient-to-r from-rose-500 via-primary to-secondary shadow-xl shadow-primary/20'
                    inactiveClass=':uno: text-[var(--text-muted)]'
                    end={true}
                    onClick={closeSidebar}
                  >
                    <FiFilePlus size={18} stroke-width={1.5} /> Atur Kegiatan
                    <div class=':uno: ml-auto'>
                      <FiChevronRight size={16} stroke-width={1.5} />
                    </div>
                  </A>
                </li>
              </ul>
            </div>
          </nav>

          <div class=':uno: space-y-1 mx-3 mb-3 border-t border-slate-800 pt-1.5 tracking-wide'>
            <p class=':uno: text-[10px] font-extrabold text-[var(--text)]'>KELOLA DATA</p>
            <ul class=':uno: flex flex-col space-y-4'>
              <li>
                <button
                  type='button'
                  onClick={() => {
                    closeSidebar();
                    navigate('/kegiatan/baru?openEmployeeManager=1');
                  }}
                  class=':uno: w-full flex text-[var(--text-muted)]/80 items-center gap-3 px-3 py-2.5 text-xs font-bold rounded-2xl transition-all ease-out duration-300 hover:(bg-[var(--surface-alt)]/50 text-white)'
                >
                  <div class=':uno: text-yellow-500'>
                    <FiUsers size={18} stroke-width={1.5} />
                  </div>
                  Master Pegawai
                  <div class=':uno: ml-auto'>
                    <Badge size='xs'>{pegawaiCount() !== null ? `${pegawaiCount()} Peg` : '...'}</Badge>
                  </div>
                </button>
              </li>
              <li>
                <button
                  type='button'
                  onClick={() => {
                    closeSidebar();
                    setPrintModalOpen(true);
                  }}
                  class=':uno: w-full flex text-[var(--text-muted)]/80 items-center gap-3 px-3 py-2.5 text-xs font-bold rounded-2xl transition-all ease-out duration-300 hover:(bg-[var(--surface-alt)]/50 text-white)'
                >
                  <div class=':uno: text-orange-400'>
                    <FiPrinter size={18} stroke-width={1.5} />
                  </div>
                  Cetak Laporan PDF
                  <div class=':uno: ml-auto'>
                    <Badge size='xs'>PDF</Badge>
                  </div>
                </button>
              </li>
              <li>
                <div class=':uno: p-3 bg-gradient-to-b from-slate-800/80 to-slate-800/40 rounded-2xl border border-slate-700/60 space-y-2.5'>
                  <div class=':uno: flex items-center justify-between'>
                    <span class=':uno: text-[11px] font-bold text-slate-300 flex items-center space-x-1.5'>
                      <FiShield size={12} stroke-width={1.5} />
                      <span>Sistem Otorisasi</span>
                    </span>

                    <span class=':uno: text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/30 flex items-center space-x-1'>
                      <FiCheckCircle size={12} stroke-width={1.5} />
                      <span>Full Admin</span>
                    </span>
                  </div>

                  <p class=':uno: text-[10px] text-slate-400'>
                    Anda memiliki akses penuh untuk menambah, mengedit, dan menghapus kegiatan pegawai.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div class=':uno: sticky backdrop-blur-sm bg-[var(--surface)]/60 bottom-0 space-y-3 px-5 border-t border-slate-800 gap-6 pt-4 py-1'>
          <div class=':uno: flex items-center py-2 px-2.5 gap-4 bg-slate-800/50 border rounded-xl border-slate-800'>
            <div class=':uno: flex items-center justify-center gap-3'>
              <div class=':uno: relative shrink-0'>
                <div class=':uno: w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm shadow-md bg-gradient-to-tr from-rose-500 via-orange-500 to-amber-500 text-white ring-2 ring-orange-500/30'>
                  {currentUser() && currentUser().role == 'admin' ? 'AD' : 'Opr'}
                </div>
                <span class=':uno: absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full' />
              </div>
              <div>
                <p class=':uno: text-[10px] font-semibold text-[var(--title)]'>Administrator Utama</p>
                <p class=':uno: text-[8px]/2.5 tracking-wider text-[var(--text-muted)]'>
                  {currentUser() && <span>@{currentUser().username}</span>}
                </p>
              </div>
            </div>
            <button
              type='button'
              onClick={handleLogout}
              class=':uno: flex shrink-0 justify-center rounded-lg border border-danger/40 items-center text-danger/40 size-7 bg-danger/8 cursor-pointer hover:(ring-2 ring-danger/15 text-danger/70)'
            >
              <FiLogOut size={16} stroke-width={1.5} />
            </button>
          </div>
          <div class=':uno: flex justify-between text-slate-600'>
            <small class=':uno: text-[11px] tracking-tight'>StaffActivity &bull; v1.0</small>
            <div class=':uno: flex items-center gap-1.5 text-[10px]'>
              <div class=':uno: size-1.2 rounded-full bg-green animate-pulse' />
              DB: Connected
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
