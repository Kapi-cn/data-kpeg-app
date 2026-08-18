import { createMemo, Show } from 'solid-js';
import { A, useLocation } from '@solidjs/router';
import { FiChevronRight, FiHome, FiList, FiFilePlus } from 'solid-icons/fi'

export default function Breadcrumb() {
  const location = useLocation();
  const segments = createMemo(() => 
    location.pathname.split('/').filter(Boolean)
  );
  
  return (
    <div class=':uno: text-[var(--text-muted)]/60 sticky z-10 top-16 layout-light px-4 py-2 bg-[var(--surface)]/95 backdrop-blur-[3px] border-t border-[var(--border)]/50 shadow-xs'>
      <ul class=':uno: flex items-center gap-3'>
        <li>
          <A
            href='/'
            class=':uno: text-sm flex items-center gap-2 tracking-wide'
            activeClass=':uno: text-primary/90 font-medium'
            end={true}
          >
            <FiHome size={16} stroke-width={2} />
            <div>Dashboard</div>
          </A>
        </li>
        <Show when={segments().length}>
          <li><FiChevronRight size={14} stroke-width={1.5} /></li>
          <li>
            <A
              href={location.pathname}
              class=':uno: text-sm flex items-center gap-2 tracking-wide'
              activeClass=':uno: text-primary/90 font-medium'
              end={true}
            >
              <Show when={segments().at(-1) == 'kegiatan'}>
                <FiList size={16} stroke-width={2} /> Data Kegiatan
              </Show>
              <Show when={segments().at(-1) == 'baru'}>
                <FiFilePlus size={16} stroke-width={2} /> Isi Kegiatan Baru
              </Show>
            </A>
          </li>
        </Show>
      </ul>
    </div>
  );
}