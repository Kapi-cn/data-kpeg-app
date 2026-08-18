const KATEGORI_KEGIATAN = {
  DLT: {
    label: 'DLT',
    bg: 'bg-blue-600',
  },
  TN: {
    label: 'TN',
    bg: 'bg-purple-600',
  },
  DP: {
    label: 'DP',
    bg: 'bg-orange-600',
  },
  DLK: {
    label: 'DLK',
    bg: 'bg-emerald-600',
  },
};

export function KategoriBadge(props) {
  const badge = KATEGORI_KEGIATAN[props.type];
  
  return (
    <div class={`:uno: rounded-lg inline px-2 py-0.5 font-semibold text-xs ${badge.bg} text-white`}>
      {badge.label}
    </div>
  );
}