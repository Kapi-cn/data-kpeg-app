import { sidebar, closeSidebar } from '../../stores/sidebar-store';

export default function BackdropEffect() {
  return (
    <div
      onClick={closeSidebar}
      classList={{
        ':uno: opacity-100': sidebar.isOpen,
        ':uno: opacity-0 pointer-events-none': !sidebar.isOpen,
      }}
      class=':uno: z-15 fixed md:opacity-0 md:pointer-events-none inset-0 bg-slate-950/60 backdrop-blur-[3px] transition-opacity duration-400 overscroll-contain overflow-y-auto'
    />
  );
}
