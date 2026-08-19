import { createSignal, Show, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';

import { getCurrentUser } from '../services/auth.js';

import {
  FiShield,
  FiArrowRight,
  FiAlertCircle,
  FiCheckCircle,
  FiServer,
  FiUser,
  FiEye,
  FiEyeOff,
  FiLock,
} from 'solid-icons/fi';
import { TbOutlineKey } from 'solid-icons/tb';

import brandIcon from '../assets/icon.svg';
import Footer from '../components/layout/Footer';
import { Badge } from '../components/ui/Badge';

export default function LoginPage() {
  const navigate = useNavigate();

  const [checkingAuth, setCheckingAuth] = createSignal(true);

  {
    /* Forms */
  }
  const [showPassword, setShowPassword] = createSignal(false);

  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');

  const [usernameErr, setUsernameErr] = createSignal('');
  const [passwordErr, setPasswordErr] = createSignal('');
  const [error, setError] = createSignal('');

  onMount(async () => {
    const currentUser = await getCurrentUser();

    if (currentUser) {
      navigate('/', { replace: true });
      return;
    }

    setCheckingAuth(false);
  });

  const handleLogin = async (e) => {
    e.preventDefault();

    const cleanUsername = username().trim().toLowerCase();

    setError('');
    setUsernameErr('');
    setPasswordErr('');

    if (!cleanUsername) {
      setUsernameErr('Username tidak boleh kosong');
      return;
    }
    if (!password()) {
      setPasswordErr('Password tidak boleh kosong');
      return;
    }

    try {
      const response = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: cleanUsername,
          password: password(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan. Silakan coba lagi atau hubungi administrator.');
    }
  };

  return (
    <Show when={!checkingAuth()}>
      <div class=':uno: relative flex items-center justify-center px-4 py-8 lg:px-8 lg:py-12 animate-fade-in min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),_transparent_30%),radial-gradient(circle_at_20%_20%,_rgba(56,189,248,0.12),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.9),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#0f172a_42%,_#111827_100%)]'>
        <div class=':uno: absolute inset-0 overflow-hidden pointer-events-none'>
          <div class=':uno: absolute -top-20 -left-20 w-72 h-72 rounded-full bg-slate-700/50 blur-3xl animate-pulse' />
          <div class=':uno: absolute top-1/3 right-0 w-80 h-80 rounded-full bg-slate-600/35 blur-3xl animate-pulse [animation-delay:1.2s]' />
          <div class=':uno: absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-orange-500/20 blur-3xl animate-pulse [animation-delay:2s]' />
          <div class=':uno: absolute top-12 left-1/4 w-48 h-48 rounded-full bg-sky-500/10 blur-3xl animate-pulse [animation-delay:2.4s]' />
          <div class=':uno: absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.09)_50%,transparent_100%)] animate-[shimmer_8s_linear_infinite]' />
          <div class=':uno: absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:36px_36px]' />
          <div class=':uno: absolute top-10 left-16 h-2.5 w-2.5 rounded-full bg-slate-200/80 shadow-lg shadow-slate-400/20 animate-bounce [animation-duration:3s]' />
          <div class=':uno: absolute top-24 right-20 h-3 w-3 rounded-full bg-orange-500/80 shadow-lg shadow-orange-500/30 animate-bounce [animation-duration:4s]' />
          <div class=':uno: absolute bottom-20 left-24 h-2 w-2 rounded-full bg-sky-400/80 shadow-lg shadow-sky-400/20 animate-bounce [animation-duration:3.5s]' />
          <div class=':uno: absolute bottom-12 right-24 h-2.5 w-2.5 rounded-full bg-slate-300/90 shadow-lg shadow-slate-300/20 animate-bounce [animation-duration:4.5s]' />
          <div class=':uno: absolute top-1/2 left-8 h-20 w-20 rounded-full border border-white/10 blur-sm animate-spin [animation-duration:16s]' />
          <div class=':uno: absolute bottom-1/4 right-10 h-28 w-28 rounded-full border border-orange-400/20 blur-sm animate-spin [animation-duration:22s]' />
        </div>
        <div class=':uno: relative z-10 max-w-4xl lg:max-w-6xl rounded-3xl shadow-white/8 shadow-xl layout-light bg-[var(--surface)] grid grid-cols-1 md:grid-cols-12 overflow-hidden'>
          {/* Left Branding Card */}
          <div class=':uno: md:col-span-5 relative layout-dark p-8 lg:p-10 bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 overflow-hidden'>
            <div class=':uno: animate-pulse absolute top-0 right-0 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none' />
            <div class=':uno: animate-pulse absolute bottom-0 left-0 w-48 h-48 bg-amber-500/20 rounded-full blur-2xl pointer-events-none' />

            <div class=':uno: relative z-10 space-y-8'>
              <div aria-label='Kegiatan Pegawai BPMPTP Icon' class=':uno: flex items-center gap-3'>
                <img
                  src={brandIcon}
                  width={32}
                  height={32}
                  alt=''
                  aria-hidden='true'
                  class=':uno: rounded-lg shadow-sm shadow-primary size-12 p-1'
                />
                <div>
                  <p aria-hidden='true' class=':uno: font-black text-2xl/5 tracking-wide text-[var(--title)]'>
                    Kegiatan
                  </p>
                  <p aria-hidden='true' class=':uno: font-bold text-xl text-[var(--title)]'>
                    Pegawai BPMPTP
                  </p>
                  <p class=':uno: text-xs text-[var(--text)] font-semibold'>Pengelola kegiatan pegawai BPMPTP</p>
                </div>
              </div>
              <div class=':uno: space-y-4 mt-12'>
                <Badge color='amber' size='md'>
                  <FiShield /> Akses Area Terproteksi
                </Badge>
                <h1 class=':uno: tracking-tight leading-7 font-bold text-2xl lg:text-3xl text-[var(--title)]'>
                  Otentikasi & Keamanan Data Pegawai
                </h1>
                <p class=':uno: text-xs/4 lg:text-sm/5 text-[var(--text-muted)] text-justify'>
                  Untuk mencegah akses tanpa izin, pembuatan data kegiatan, penyuntingan, dan pengelolaan master pegawai
                  memerlukan identifikasi akun yang terverifikasi.
                </p>
              </div>
              <div>
                <ul class=':uno: flex flex-col text-[var(--text-muted)] space-y-2 text-[12px]/4'>
                  <li class=':uno: flex items-center gap-3'>
                    <span class=':uno: text-primary'>
                      <FiCheckCircle size={14} stroke-width={1.5} />
                    </span>
                    Input & rekap kegiatan pegawai
                  </li>
                  <li class=':uno: flex items-center gap-3'>
                    <span class=':uno: text-primary'>
                      <FiCheckCircle size={14} stroke-width={1.5} />
                    </span>
                    Pencetakan laporan resmi format PDF
                  </li>
                  <li class=':uno: flex items-center gap-3'>
                    <span class=':uno: text-primary'>
                      <FiCheckCircle size={14} stroke-width={1.5} />
                    </span>
                    Pengelolaan data master pegawai
                  </li>
                </ul>
              </div>
            </div>

            <div class=':uno: relative z-10 pt-8 border-t border-slate-400/40 mt-8 text-[11px] text-[var(--text)] flex items-center justify-between'>
              <span>Kpeg &bull; v1.0</span>
              <span class=':uno: flex items-center space-x-1'>
                <FiServer stroke-width={1.5} />
                <span>Server Aktif 24h</span>
              </span>
            </div>
          </div>

          {/* Right Form Side */}
          <div class=':uno: md:col-span-7 layout-light p-10 lg:p-12 space-y-6 overflow-hidden'>
            <div>
              <h2 class=':uno: text-xl lg:text-2xl font-bold text-[var(--title)]'>Masuk ke Aplikasi</h2>
              <p class=':uno: text-xs/4 lg:text-sm/5 text-[var(--text)]'>
                Masukkan Username beserta Password Anda dibawah dengan benar.
              </p>
            </div>

            <Show when={error()}>
              <div class=':uno: flex items-center border font-medium border-danger/20 p-2.5 gap-3 text-danger/80 rounded-xl text-xs bg-danger/10'>
                <FiAlertCircle size={16} stroke-width={1.5} /> {error()}
              </div>
            </Show>

            <form onSubmit={handleLogin} class=':uno: space-y-4'>
              <div>
                <label for='username' class=':uno: block mb-1.5 text-xs text-[var(--title)]/80 font-semibold'>
                  Username
                </label>
                <div class=':uno: relative'>
                  <div class=':uno: absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text)]'>
                    <FiUser size={16} stroke-width={2} />
                  </div>
                  <input
                    type='text'
                    id='username'
                    value={username()}
                    onInput={(e) => {
                      setUsername(e.currentTarget.value);
                      if (usernameErr()) setUsernameErr('');
                    }}
                    class=':uno: py-2.5 lg:py-3 pl-10 pr-4 text-xs lg:text-sm text-[var(--text)] w-full bg-slate-50 border border-slate-200 rounded-xl focus:(border-primary/80 outline-2 outline-primary/20) transition-colors duration-200'
                    placeholder='Masukkan Username Anda'
                  />
                </div>
                <Show when={usernameErr()}>
                  <p class=':uno: mt-1 ml-0.5 flex items-center gap-1 text-xs text-rose-600'>
                    <FiAlertCircle size={12} stroke-width={2} /> Username tidak boleh kosong
                  </p>
                </Show>
              </div>
              <div>
                <label for='password' class=':uno: block mb-1.5 text-xs text-[var(--title)]/80 font-semibold'>
                  Password
                </label>
                <div class=':uno: relative'>
                  <div class=':uno: absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text)]'>
                    <TbOutlineKey />
                  </div>
                  <input
                    type={showPassword() ? 'text' : 'password'}
                    id='password'
                    value={password()}
                    onInput={(e) => {
                      setPassword(e.currentTarget.value);
                      if (passwordErr()) setPasswordErr('');
                    }}
                    class=':uno: py-2.5 lg:py-3 px-10 text-xs lg:text-sm text-[var(--text)] w-full bg-slate-50 border border-slate-200 rounded-xl focus:(border-primary/80 outline-2 outline-primary/20) transition-colors duration-200'
                    placeholder='Masukkan Password atau PIN Anda'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword())}
                    class=':uno: absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text)]'
                  >
                    {showPassword() ? <FiEye size={16} stroke-width={2} /> : <FiEyeOff size={16} stroke-width={2} />}
                  </button>
                </div>
                <Show when={passwordErr()}>
                  <p class=':uno: mt-1 ml-0.5 flex items-center gap-1 text-xs text-rose-600'>
                    <FiAlertCircle size={12} stroke-width={2} /> Password tidak boleh kosong
                  </p>
                </Show>
              </div>
              <button
                type='submit'
                class=':uno: mt-10 flex items-center gap-3 font-bold justify-center px-3 py-2 lg:py-3 text-amber-50 w-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/30 active:scale-95'
              >
                <FiLock size={16} stroke-width={2.5} />
                Masuk Sekarang
                <FiArrowRight size={16} stroke-width={2.5} />
              </button>
            </form>

            <div class=':uno: border-t border-[var(--border)]'>
              <div class=':uno: p-4 bg-gradient-to-br from-orange-50/80 via-slate-50 to-amber-50/60 border border-orange-200/80 rounded-2xl mt-5 flex items-start gap-3'>
                <div class=':uno: text-white shrink-0 bg-primary/70 rounded-xl p-2 flex items-center justify-center'>
                  <FiAlertCircle size={16} />
                </div>
                <div class=':uno: space-y-1 text-xs'>
                  <h3 class=':uno: font-bold text-[var(--title)]'>Mengalami Kendala Akses Login?</h3>
                  <p class=':uno: font-medium text-[var(--text)]'>
                    Stuck? Hubungi administrator sistem IT untuk bantuan pemulihan kredensial, perbaikan akun, atau
                    reset password login Anda.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Show>
  );
}
