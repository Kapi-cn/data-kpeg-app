const badgeColor = {
  none: {
    bg: 'bg-slate-600/20',
    text: 'text-slate-500',
    ring: 'ring-slate-600',
  },
  rose: {
    bg: 'bg-rose-600/20',
    text: 'text-rose-500',
    ring: 'ring-rose-600/40',
  },
  orange: {
    bg: 'bg-orange-600/20',
    text: 'text-orange-500',
    ring: 'ring-orange-500',
  },
  amber: {
    bg: 'bg-amber-600/10',
    text: 'text-amber-500/90',
    ring: 'ring-amber-500/60',
  },
  yellow: {
    bg: 'bg-yellow-600/20',
    text: 'text-yellow-500',
    ring: 'ring-yellow-500',
  },
};

const badgeSize = {
  xs: 'text-[8px]',
  sm: 'text-[10px]',
  md: 'text-[12px] px-2.5 py-1',
};

export function Badge(props) {
  const color = badgeColor[props.color] || badgeColor.none;
  const size = badgeSize[props.size] || badgeSize.sm;

  return (
    <div
      class={`:uno: ${color.bg} ${color.text} ${color.ring} inline-flex items-center gap-2 ${size} font-extrabold rounded-full px-2 py-0.1 ring`}
    >
      {props.children}
    </div>
  );
}
