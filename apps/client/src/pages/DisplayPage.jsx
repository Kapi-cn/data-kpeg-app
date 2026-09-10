import {
	createEffect,
	createMemo,
	createResource,
	createSignal,
	For,
	Show,
} from "solid-js";
import {
	FiCalendar,
	FiClock,
	FiInfo,
	FiMapPin,
	FiSearch,
	FiSliders,
	FiUsers,
} from "solid-icons/fi";
import { getKegiatanAll, getKegiatanBalaiAll } from "../services/kegiatan.js";
import { getPegawai } from "../services/pegawai.js";
import { formatKegiatanWaktu } from "../utils/date.js";

const MONTH_NAMES = [
	"Januari",
	"Februari",
	"Maret",
	"April",
	"Mei",
	"Juni",
	"Juli",
	"Agustus",
	"September",
	"Oktober",
	"November",
	"Desember",
];
const CATEGORIES = ["DLK", "DP", "TN", "DLT"];
const TAB_ROTATION_INTERVAL = 16000;
const getMonth = (value) => {
	const date = new Date(value);
	return Number.isNaN(date.getTime())
		? String(value || "").slice(0, 7)
		: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};
export default function DisplayPage() {
	const [kegiatanData] = createResource(getKegiatanAll);
	const [agendaBalaiData] = createResource(getKegiatanBalaiAll);
	const [pegawaiData] = createResource(getPegawai);
	const today = new Date();
	const [selectedMonth, setSelectedMonth] = createSignal(
		`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`,
	);
	const [activeTab, setActiveTab] = createSignal("agenda");
	const [search, setSearch] = createSignal("");
	const [activeOnly, setActiveOnly] = createSignal(false);
	const [currentTime, setCurrentTime] = createSignal(new Date());
	const [slideDirection, setSlideDirection] = createSignal("");
	const changeTab = (nextTab) => {
		if (nextTab === activeTab()) return;
		setSlideDirection(nextTab === "pegawai" ? "to-pegawai" : "to-agenda");
		setActiveTab(nextTab);
	};
	const agendaPanelClass = () =>
		activeTab() === "agenda"
			? slideDirection() === "to-agenda"
				? "carousel-slide-in-left"
				: "carousel-slide-active"
			: slideDirection() === "to-pegawai"
				? "carousel-slide-out-left"
				: "carousel-slide-off-left";
	const pegawaiPanelClass = () =>
		activeTab() === "pegawai"
			? slideDirection() === "to-pegawai"
				? "carousel-slide-in-right"
				: "carousel-slide-active"
			: slideDirection() === "to-agenda"
				? "carousel-slide-out-right"
				: "carousel-slide-off-right";
	const allKegiatan = () =>
		Array.isArray(kegiatanData()) ? kegiatanData() : [];
	const allPegawai = () => (Array.isArray(pegawaiData()) ? pegawaiData() : []);
	const monthLabel = () => {
		const [year, month] = selectedMonth().split("-");
		return `${MONTH_NAMES[Number(month) - 1]} ${year}`;
	};
	const query = () => search().trim().toLowerCase();
	const monthKegiatan = createMemo(() =>
		allKegiatan().filter(
			(item) =>
				getMonth(item.waktu_mulai) === selectedMonth() ||
				getMonth(item.waktu_selesai) === selectedMonth(),
		),
	);
	const monthAgendaBalai = createMemo(() =>
		(Array.isArray(agendaBalaiData()) ? agendaBalaiData() : []).filter(
			(item) => getMonth(item.tanggal) === selectedMonth(),
		),
	);
	const agendaBalai = createMemo(() =>
		monthAgendaBalai()
			.map((item) => {
				const tanggal = String(item.tanggal || "").slice(0, 10);
				const jam = String(item.jam || "").slice(11, 19) || "00:00:00";
				return {
					...item,
					waktu_mulai: `${tanggal}T${jam}`,
					waktu_selesai: `${tanggal}T${jam}`,
				};
			})
			.filter(
				(item) =>
					getMonth(item.waktu_mulai) === selectedMonth() &&
					(!query() ||
						[item.nama_kegiatan, item.lokasi].some((value) =>
							String(value || "")
								.toLowerCase()
								.includes(query()),
						)),
			)
			.sort((a, b) => new Date(a.waktu_mulai) - new Date(b.waktu_mulai)),
	);
	const employees = createMemo(() =>
		allPegawai()
			.map((pegawai) => {
				const kegiatan = monthKegiatan().filter((item) =>
					(item.pegawai || []).some(
						(person) => Number(person.id) === Number(pegawai.id),
					),
				);
				const counts = Object.fromEntries(
					CATEGORIES.map((category) => [
						category,
						kegiatan.filter((item) => item.kategori === category).length,
					]),
				);
				return {
					pegawai,
					kegiatan,
					counts,
					total: kegiatan.length,
				};
			})
			.filter(
				(row) =>
					(!activeOnly() || row.total > 0) &&
					(!query() ||
						row.pegawai.nama.toLowerCase().includes(query()) ||
						row.kegiatan.some((item) =>
							item.nama_kegiatan.toLowerCase().includes(query()),
						)),
			)
			.sort(
				(a, b) =>
					b.total - a.total || a.pegawai.nama.localeCompare(b.pegawai.nama),
			),
	);
	const activeEmployees = createMemo(
		() =>
			allPegawai().filter((pegawai) =>
				monthKegiatan().some(
					(item) =>
						CATEGORIES.includes(item.kategori) &&
						(item.pegawai || []).some(
							(person) => Number(person.id) === Number(pegawai.id),
						),
				),
			).length,
	);
	const formattedCurrentDate = () =>
		currentTime().toLocaleDateString("id-ID", {
			weekday: "long",
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	const formattedCurrentTime = () =>
		currentTime().toLocaleTimeString("id-ID", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
	createEffect(() => {
		const clock = window.setInterval(() => setCurrentTime(new Date()), 1000);
		const handleKeyDown = (event) => {
			if (["INPUT", "SELECT", "TEXTAREA"].includes(event.target?.tagName))
				return;
			if (event.key === "ArrowLeft") changeTab("agenda");
			if (event.key === "ArrowRight") changeTab("pegawai");
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.clearInterval(clock);
			window.removeEventListener("keydown", handleKeyDown);
		};
	});
	createEffect(() => {
		if (search().trim()) return;
		const tabRotation = window.setInterval(() => {
			changeTab(activeTab() === "agenda" ? "pegawai" : "agenda");
		}, TAB_ROTATION_INTERVAL);
		return () => window.clearInterval(tabRotation);
	});
	return (
		<div class=":uno: space-y-6 animate-fade-in pb-12">
			<div class=":uno: dashboard-header">
				<div>
					<div class=":uno: dashboard-kicker">
						<FiCalendar size={14} /> LIVE DISPLAY
					</div>
					<h1>Display Kegiatan</h1>
					<p>
						Rekapitulasi agenda resmi instansi balai dan partisipasi kegiatan
						pegawai.
					</p>
				</div>
				<div class=":uno: dashboard-controls">
					<input
						type="month"
						value={selectedMonth()}
						onInput={(event) => setSelectedMonth(event.currentTarget.value)}
						class=":uno: select-control"
						title="Pilih bulan"
					/>
				</div>
			</div>
			<div class=":uno: grid grid-cols-1 sm:grid-cols-3 gap-3">
				<Stat
					icon={<FiCalendar size={18} />}
					label="Agenda Balai"
					value={monthAgendaBalai().length}
					suffix="kegiatan"
				/>
				<Stat
					icon={<FiUsers size={18} />}
					label="Pegawai Aktif"
					value={activeEmployees()}
					suffix={`/ ${allPegawai().length} pegawai`}
				/>
				<Stat
					icon={<FiClock size={18} />}
					label="Waktu Sekarang"
					value={formattedCurrentTime()}
					suffix={formattedCurrentDate()}
				/>
			</div>
			<div class=":uno: bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print:hidden">
				<div class=":uno: p-4 border-b border-slate-200 flex flex-col sm:(flex-row items-center justify-between) gap-3 bg-slate-50/60">
					<div class=":uno: flex items-center bg-slate-200/70 p-1 rounded-xl w-full sm:w-auto">
						<Tab
							active={activeTab() === "agenda"}
							onClick={() => changeTab("agenda")}
							icon={<FiCalendar size={14} />}
							label="Agenda Balai"
							count={agendaBalai().length}
						/>
						<Tab
							active={activeTab() === "pegawai"}
							onClick={() => changeTab("pegawai")}
							icon={<FiUsers size={14} />}
							label="Summary Pegawai"
							count={employees().length}
						/>
					</div>
					<div class=":uno: flex items-center gap-2 w-full sm:w-auto">
						<div class=":uno: relative flex-1 sm:w-60">
							<FiSearch
								class=":uno: absolute left-3 top-2.5 text-slate-400"
								size={14}
							/>
							<input
								type="search"
								value={search()}
								onInput={(event) => setSearch(event.currentTarget.value)}
								placeholder={
									activeTab() === "agenda"
										? "Cari agenda atau lokasi..."
										: "Cari pegawai atau kegiatan..."
								}
								class=":uno: w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none"
							/>
						</div>
					</div>
				</div>
				<Show
					when={
						!kegiatanData.loading &&
						!agendaBalaiData.loading &&
						!pegawaiData.loading
					}
					fallback={
						<div class=":uno: py-16 text-center text-xs text-slate-400">
							Memuat data display...
						</div>
					}
				>
					<div class=":uno: display-carousel">
						<div class={`:uno: display-carousel-panel ${agendaPanelClass()}`}>
							<AgendaTable rows={agendaBalai()} />
						</div>
						<div class={`:uno: display-carousel-panel ${pegawaiPanelClass()}`}>
							<EmployeeTable rows={employees()} />
						</div>
					</div>
				</Show>
				<div class=":uno: p-3 bg-slate-50/60 border-t border-slate-200 flex items-center gap-1.5 text-[11px] text-slate-500">
					<FiInfo size={14} />
					<span>
						{activeTab() === "agenda"
							? `Menampilkan ${agendaBalai().length} agenda balai pada ${monthLabel()}`
							: `Menampilkan ${employees().length} pegawai (${activeEmployees()} bertugas aktif)`}
					</span>
				</div>
			</div>
		</div>
	);
}

function Stat(props) {
	return (
		<div class=":uno: bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
			<div class=":uno: p-2 rounded-xl bg-orange-50 text-orange-600">
				{props.icon}
			</div>
			<div>
				<p class=":uno: text-[11px] text-slate-500">{props.label}</p>
				<p class=":uno: text-base font-bold">
					{props.value}{" "}
					<span class=":uno: text-xs font-normal text-slate-500">
						{props.suffix}
					</span>
				</p>
			</div>
		</div>
	);
}
function Tab(props) {
	const stateClass = () =>
		props.active ? "bg-white text-orange-600 shadow-xs" : "text-slate-600";
	return (
		<button
			type="button"
			onClick={props.onClick}
			class={`:uno: flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${stateClass()}`}
		>
			{props.icon}
			{props.label}
		</button>
	);
}
function EmptyRow(props) {
	return (
		<tr>
			<td
				colSpan={props.columns}
				class=":uno: py-12 text-center text-slate-400"
			>
				<FiCalendar class=":uno: mx-auto mb-2 text-slate-300" size={30} />
				<p class=":uno: text-xs font-semibold text-slate-600">
					{props.message}
				</p>
			</td>
		</tr>
	);
}
function AgendaTable(props) {
	return (
		<div class=":uno: overflow-x-auto">
			<table class=":uno: w-full text-left text-xs border-collapse">
				<thead>
					<tr class=":uno: bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
						<th class=":uno: p-3 text-center">No</th>
						<th class=":uno: p-3">Tanggal</th>
						<th class=":uno: p-3">Waktu</th>
						<th class=":uno: p-3 min-w-60">Agenda Kegiatan</th>
						<th class=":uno: p-3">Tempat / Lokasi</th>
						<th class=":uno: p-3">Status</th>
					</tr>
				</thead>
				<tbody class=":uno: divide-y divide-slate-100">
					<Show
						when={props.rows.length}
						fallback={
							<EmptyRow
								columns="6"
								message="Tidak ada agenda balai pada bulan ini"
							/>
						}
					>
						<For each={props.rows}>
							{(item, index) => {
								const waktu = formatKegiatanWaktu(
									item.waktu_mulai,
									item.waktu_selesai,
								);
								return (
									<tr class=":uno: hover:bg-orange-50/20">
										<td class=":uno: p-3 text-center text-slate-400">
											{index() + 1}
										</td>
										<td class=":uno: p-3 font-semibold">{waktu.date}</td>
										<td class=":uno: p-3 font-mono text-[11px]">
											<FiClock
												class=":uno: inline text-slate-400 mr-1"
												size={12}
											/>
											{waktu.time} WIB
										</td>
										<td class=":uno: p-3">
											<div class=":uno: font-semibold text-slate-900">
												{item.nama_kegiatan}
											</div>
											<div class=":uno: text-[11px] text-slate-500">
												{(item.pegawai || []).length} pegawai terlibat
											</div>
										</td>
										<td class=":uno: p-3">
											<FiMapPin
												class=":uno: inline text-rose-500 mr-1"
												size={13}
											/>
											{item.lokasi}
										</td>
										<td class=":uno: p-3">
											<span class=":uno: px-2 py-1 rounded-md bg-slate-100 font-semibold">
												{item.status || "Rencana"}
											</span>
										</td>
									</tr>
								);
							}}
						</For>
					</Show>
				</tbody>
			</table>
		</div>
	);
}
function EmployeeTable(props) {
	return (
		<div class=":uno: overflow-x-auto">
			<table class=":uno: w-full text-left text-xs border-collapse">
				<thead>
					<tr class=":uno: bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
						<th class=":uno: p-3 text-center">No</th>
						<th class=":uno: p-3">Nama Pegawai</th>
						<th class=":uno: p-3 text-center">Klasifikasi Dinas</th>
					</tr>
				</thead>
				<tbody class=":uno: divide-y divide-slate-100">
					<Show
						when={props.rows.length}
						fallback={
							<EmptyRow
								columns="3"
								message="Tidak ada data pegawai yang sesuai"
							/>
						}
					>
						<For each={props.rows}>
							{(row, index) => (
								<tr class=":uno: hover:bg-amber-50/20">
									<td class=":uno: p-3 text-center text-slate-400 align-top">
										{index() + 1}
									</td>
									<td class=":uno: p-3 align-top">
										<div class=":uno: font-bold text-slate-900">
											{row.pegawai.nama}
										</div>
										<div class=":uno: text-[11px] text-slate-500">
											ID Pegawai: {row.pegawai.id}
										</div>
									</td>
									<td class=":uno: p-3 align-top">
										<div class=":uno: flex flex-wrap justify-center gap-1.5">
											<For each={CATEGORIES}>
												{(category) => (
													<span class=":uno: px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-100 text-orange-800">
														{category}: {row.counts[category]}
													</span>
												)}
											</For>
										</div>
									</td>
								</tr>
							)}
						</For>
					</Show>
				</tbody>
			</table>
		</div>
	);
}
