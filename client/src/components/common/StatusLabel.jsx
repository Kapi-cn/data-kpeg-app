const STATUS_LABEL = {
  terjadwal: {
    label: 'Terjadwal',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  berlangsung: {
    label: 'Berlangsung',
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
    text: 'text-orange-700',
    dot: 'bg-orange-500 animate-pulse',
  },
  selesai: {
    label: 'Selesai',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  dibatalkan: {
    label: 'Dibatalkan',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
  },
  '*': {
    label: 'Unknown',
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-500',
  },
};

export function StatusLabel(props) {
  const rawValue = String(props.label ?? '').trim();
  const key = rawValue.toLowerCase();
  const config = STATUS_LABEL[key] || STATUS_LABEL['*'];
  const labelText = config.label || rawValue || 'Terjadwal';

  return (
    <span
      class={`:uno: ${config.text} ${config.bg} inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border`}
    >
      <span class={`:uno: ${config.dot} w-2 h-2 rounded-full`} />
      <span>{labelText}</span>
    </span>
  );
}
