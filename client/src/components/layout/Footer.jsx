import brandIcon from '../../assets/icon.svg';

export default function Footer() {
  const thisYear = new Date().getFullYear();

  return (
    <footer class=':uno: layout-light flex flex-col items-center justify-center gap-3 bg-[var(--surface)] border-t border-[var(--border)] w-full py-3'>
      <p class='text-sm text-[var(--text-muted)]'>
        <small>&copy; {thisYear} BPMPTP. All Rights Reserved.</small>
      </p>
      <div
        aria-label='Kegiatan Pegawai BPMPTP Icon'
        class=':uno: rounded-xl shadow-sm border border-slate-50 flex items-center gap-2 py-0.5 px-2'
      >
        <img src={brandIcon} width={22} height={22} alt='' aria-hidden='true' class=':uno: size-8 p-1' />
        <div>
          <p aria-hidden='true' class=':uno: font-black text-[12px] tracking-wide text-[var(--title)]'>
            Kegiatan
          </p>
          <p aria-hidden='true' class=':uno: font-bold text-[10px]/2 text-[var(--title)]/90'>
            Pegawai BPMPTP
          </p>
        </div>
      </div>
    </footer>
  );
}
