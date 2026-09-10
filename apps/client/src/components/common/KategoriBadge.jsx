const KATEGORI_KEGIATAN = {
	DLT: {
		label: "DLT",
		style: "bg-blue-50 text-blue-700 border-blue-200",
	},
	TN: {
		label: "TN",
		style: "bg-violet-50 text-violet-700 border-violet-200",
	},
	DP: {
		label: "DP",
		style: "bg-amber-50 text-amber-700 border-amber-200",
	},
	DLK: {
		label: "DLK",
		style: "bg-emerald-50 text-emerald-700 border-emerald-200",
	},
};

export function KategoriBadge(props) {
	const badge = KATEGORI_KEGIATAN[props.type];

	return (
		<div
			class={`:uno: inline rounded-md border px-2 py-0.5 text-xs font-bold ${badge.style}`}
		>
			{badge.label}
		</div>
	);
}
