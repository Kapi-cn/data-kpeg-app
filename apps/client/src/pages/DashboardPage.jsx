import { createMemo, createResource, createSignal, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import {
	FiActivity,
	FiArrowUpRight,
	FiCalendar,
	FiCheckCircle,
	FiChevronDown,
	FiClock,
	FiLayers,
	FiPlus,
	FiUsers,
} from "solid-icons/fi";
import { getKegiatanAll } from "../services/kegiatan.js";
import { getPegawai } from "../services/pegawai.js";

const CATEGORY_INFO = {
	DLT: { color: "#4f46e5" },
	TN: { color: "#6366f1" },
	DP: { color: "#818cf8" },
	DLK: { color: "#a5b4fc" },
};
const CATEGORY_KEYS = ["DLT", "TN", "DP", "DLK"];
const STATUS_KEYS = ["Selesai", "Berlangsung", "Rencana", "Dibatalkan"];
const STATUS_COLORS = {
	Selesai: "#4f46e5",
	Berlangsung: "#6366f1",
	Rencana: "#a5b4fc",
	Dibatalkan: "#c7d2fe",
};
const MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"Mei",
	"Jun",
	"Jul",
	"Agu",
	"Sep",
	"Okt",
	"Nov",
	"Des",
];
const normalizeStatus = (value) => {
	const status = String(value || "")
		.trim()
		.toLowerCase();
	if (status === "selesai") return "Selesai";
	if (status === "berlangsung") return "Berlangsung";
	if (status === "dibatalkan") return "Dibatalkan";
	return "Rencana";
};
const normalizeCategory = (value) => {
	const category = String(value || "")
		.trim()
		.toUpperCase();
	return CATEGORY_KEYS.includes(category) ? category : "DLT";
};
const dateValue = (value) => {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
};
const durationHours = (item) => {
	const start = dateValue(item.waktu_mulai);
	const end = dateValue(item.waktu_selesai);
	return start && end ? Math.max(0, (end - start) / 3600000) : 0;
};
const formatNumber = (value) =>
	new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(value);

export default function DashboardPage() {
	const navigate = useNavigate();
	const [kegiatanData] = createResource(getKegiatanAll);
	const [pegawaiData] = createResource(getPegawai);
	const [period, setPeriod] = createSignal("all");
	const allKegiatan = () => {
		const value = kegiatanData();
		return Array.isArray(value)
			? value
			: Array.isArray(value?.data)
				? value.data
				: [];
	};
	const allPegawai = () => {
		const value = pegawaiData();
		return Array.isArray(value)
			? value
			: Array.isArray(value?.data)
				? value.data
				: [];
	};
	const filteredKegiatan = createMemo(() => {
		const now = new Date();
		return allKegiatan().filter((item) => {
			const date = dateValue(item.waktu_mulai);
			if (!date || period() === "all") return period() === "all";
			if (period() === "7") return (now - date) / 86400000 <= 7 && date <= now;
			if (period() === "30")
				return (now - date) / 86400000 <= 30 && date <= now;
			return date.getFullYear() === now.getFullYear();
		});
	});
	const totalHours = createMemo(() =>
		filteredKegiatan().reduce((sum, item) => sum + durationHours(item), 0),
	);
	const completedCount = createMemo(
		() =>
			filteredKegiatan().filter(
				(item) => normalizeStatus(item.status) === "Selesai",
			).length,
	);
	const activePeople = createMemo(() => {
		const ids = new Set();
		filteredKegiatan().forEach((item) => {
			(item.pegawai || []).forEach((person) => {
				ids.add(Number(person.id));
			});
		});
		return ids.size;
	});
	const completionRate = createMemo(() =>
		filteredKegiatan().length
			? Math.round((completedCount() / filteredKegiatan().length) * 100)
			: 0,
	);
	const monthlyTrend = createMemo(() => {
		const now = new Date();
		const months = Array.from({ length: 6 }, (_, index) => {
			const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
			return {
				year: date.getFullYear(),
				month: date.getMonth(),
				label: MONTHS[date.getMonth()],
				count: 0,
			};
		});
		filteredKegiatan().forEach((item) => {
			const date = dateValue(item.waktu_mulai);
			const month = months.find(
				(entry) =>
					entry.year === date?.getFullYear() &&
					entry.month === date?.getMonth(),
			);
			if (month) month.count += 1;
		});
		return months;
	});
	const categoryStats = createMemo(() =>
		CATEGORY_KEYS.map((key) => ({
			key,
			count: filteredKegiatan().filter(
				(item) => normalizeCategory(item.kategori) === key,
			).length,
			...CATEGORY_INFO[key],
		})),
	);
	const statusStats = createMemo(() =>
		STATUS_KEYS.map((key) => ({
			key,
			count: filteredKegiatan().filter(
				(item) => normalizeStatus(item.status) === key,
			).length,
			color: STATUS_COLORS[key],
		})),
	);
	const locationStats = createMemo(() => {
		const locations = new Map();
		filteredKegiatan().forEach((item) => {
			const location =
				String(item.lokasi || "Tanpa lokasi").trim() || "Tanpa lokasi";
			locations.set(location, (locations.get(location) || 0) + 1);
		});
		return [...locations.entries()]
			.map(([label, count]) => ({ label, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 5);
	});
	const employeeStats = createMemo(() =>
		allPegawai()
			.map((employee) => {
				const activities = filteredKegiatan().filter((item) =>
					(item.pegawai || []).some(
						(person) => Number(person.id) === Number(employee.id),
					),
				);
				return {
					employee,
					count: activities.length,
					hours: activities.reduce((sum, item) => sum + durationHours(item), 0),
				};
			})
			.filter((item) => item.count)
			.sort((a, b) => b.hours - a.hours)
			.slice(0, 4),
	);

	return (
		<div class="dashboard-shell animate-fade-in">
			<header class="dashboard-header">
				<div>
					<div class="dashboard-kicker">
						<FiActivity size={14} /> DATA ANALYTICS
					</div>
					<h1>Dashboard Analisis Kegiatan</h1>
					<p>
						Visualisasi produktivitas dan pemantauan realisasi tugas pegawai
						instansi.
					</p>
				</div>
				<div class="dashboard-controls">
					<label class="select-control">
						<FiLayers size={15} />
						<select
							value={period()}
							onChange={(event) => setPeriod(event.currentTarget.value)}
						>
							<option value="all">Semua Data</option>
							<option value="365">Tahun Ini</option>
							<option value="30">30 Hari</option>
							<option value="7">7 Hari</option>
						</select>
						<FiChevronDown size={14} />
					</label>
					<button
						class="outline-action"
						type="button"
						onClick={() => navigate("/kegiatan/baru")}
					>
						<FiPlus size={15} /> Kegiatan Baru
					</button>
				</div>
			</header>
			<Show
				when={!kegiatanData.loading && !pegawaiData.loading}
				fallback={<DashboardLoading />}
			>
				<section class=":uno: mt-4 gap-2 grid grid-cols-2 lg:grid-cols-4">
					<MetricCard
						label="Total Kegiatan"
						value={filteredKegiatan().length}
						suffix="kegiatan"
						detail="Tercatat dalam periode ini"
						icon={<FiCalendar />}
					/>
					<MetricCard
						label="Total Jam Kerja"
						value={formatNumber(totalHours())}
						suffix="jam kerja"
						detail={`${formatNumber(filteredKegiatan().length ? totalHours() / filteredKegiatan().length : 0)} jam per aktivitas`}
						icon={<FiClock />}
					/>
					<MetricCard
						label="Tingkat Selesai"
						value={`${completionRate()}%`}
						suffix={`(${completedCount()}/${filteredKegiatan().length})`}
						detail="Aktivitas berstatus selesai"
						icon={<FiCheckCircle />}
						progress={completionRate()}
					/>
					<MetricCard
						label="Pegawai Terlibat"
						value={activePeople()}
						suffix="aparatur aktif"
						detail={`Tersebar di ${locationStats().length || 1} lokasi kegiatan`}
						icon={<FiUsers />}
					/>
				</section>
				<section class="dashboard-grid dashboard-grid-main">
					<Panel
						title="Tren Dinamika Kegiatan"
						subtitle="Pemantauan volume aktivitas dalam 6 bulan terakhir"
						tag="Volume aktivitas"
					>
						<TrendChart data={monthlyTrend()} />
					</Panel>
					<Panel
						title="Kategori Kegiatan"
						subtitle="Komposisi jenis tugas yang dikerjakan pegawai"
						tag="Distribusi"
					>
						<CategoryChart
							data={categoryStats()}
							total={filteredKegiatan().length}
						/>
					</Panel>
				</section>
				<section class="dashboard-grid dashboard-grid-secondary">
					<Panel
						title="Kegiatan Berdasarkan Lokasi"
						subtitle="Lokasi dengan jumlah kegiatan terbanyak dalam periode analisis"
						tag={`${locationStats().length} lokasi`}
					>
						<LocationChart data={locationStats()} />
					</Panel>
					<Panel
						title="Status Pelaksanaan"
						subtitle="Distribusi status penyelesaian kegiatan"
						tag="Realisasi"
					>
						<StatusChart
							data={statusStats()}
							total={filteredKegiatan().length}
							onDetail={() => navigate("/kegiatan")}
						/>
					</Panel>
				</section>
				<section class="dashboard-grid dashboard-grid-bottom">
					<Panel
						title="Pegawai dengan Kontribusi Kegiatan Terbanyak"
						subtitle="Berdasarkan akumulasi jam kerja dan pelaporan tugas"
						tag="Top 4 Aparatur"
					>
						<EmployeeRanking data={employeeStats()} />
					</Panel>
					<div class="quick-panel">
						<div class="quick-icon">
							<FiActivity size={20} />
						</div>
						<h2>Ingin Mencatat Kegiatan Baru?</h2>
						<p>
							Catat log pekerjaan harian, durasi, hasil capaian, dan dokumen
							pendukung untuk evaluasi kinerja terpadu.
						</p>
						<button
							type="button"
							class="primary-action"
							onClick={() => navigate("/kegiatan/baru")}
						>
							<FiPlus size={15} /> Buat Entri Kegiatan Baru
						</button>
						<button
							type="button"
							class="secondary-action"
							onClick={() => navigate("/kegiatan")}
						>
							Buka Semua Data Kegiatan <FiArrowUpRight size={14} />
						</button>
					</div>
				</section>
			</Show>
		</div>
	);
}

function MetricCard(props) {
	return (
		<article class="metric-card">
			<div class="metric-card-top">
				<span>{props.label}</span>
				<span class="metric-icon">{props.icon}</span>
			</div>
			<div class="metric-value">
				{props.value} <small>{props.suffix}</small>
			</div>
			<p>
				{props.progress !== undefined ? (
					<span class="metric-progress">
						<span style={{ width: `${props.progress}%` }} />
					</span>
				) : (
					<span class="metric-dot" />
				)}{" "}
				{props.detail}
			</p>
		</article>
	);
}
function Panel(props) {
	return (
		<article class="chart-panel">
			<div class="panel-heading">
				<div>
					<h2>{props.title}</h2>
					<p>{props.subtitle}</p>
				</div>
				<span class="panel-tag">{props.tag}</span>
			</div>
			{props.children}
		</article>
	);
}
function TrendChart(props) {
	const max = () => Math.max(...props.data.map((item) => item.count), 1);
	const points = () =>
		props.data
			.map(
				(item, index) =>
					`${30 + index * 116},${150 - (item.count / max()) * 116}`,
			)
			.join(" ");
	const areaPoints = () =>
		`30,150 ${points()} ${30 + (props.data.length - 1) * 116},150`;
	return (
		<div class="trend-chart">
			<svg
				viewBox="0 0 620 190"
				role="img"
				aria-label="Tren kegiatan enam bulan"
			>
				<defs>
					<linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1">
						<stop offset="0%" stop-color="#6366f1" stop-opacity=".34" />
						<stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
					</linearGradient>
				</defs>
				<line x1="30" y1="34" x2="610" y2="34" class="chart-grid-line" />
				<line x1="30" y1="92" x2="610" y2="92" class="chart-grid-line" />
				<line x1="30" y1="150" x2="610" y2="150" class="chart-grid-line" />
				<polygon points={areaPoints()} fill="url(#trend-fill)" />
				<polyline points={points()} class="trend-line" />
				{props.data.map((item, index) => (
					<circle
						cx={30 + index * 116}
						cy={150 - (item.count / max()) * 116}
						r="4"
						class="trend-point"
					/>
				))}
			</svg>
			<div class="chart-labels">
				<For each={props.data}>{(item) => <span>{item.label}</span>}</For>
			</div>
			<div class="panel-footnote">
				<span>
					<i class="legend-dot" /> Kegiatan per bulan
				</span>
				<span>Data real-time dari kegiatan</span>
			</div>
		</div>
	);
}
function CategoryChart(props) {
	const total = () => props.total || 1;
	const gradient = () => {
		let cursor = 0;
		return props.data
			.map((item) => {
				const start = cursor;
				cursor += (item.count / total()) * 360;
				return `${item.color} ${start}deg ${cursor}deg`;
			})
			.join(", ");
	};
	return (
		<div class="category-chart">
			<div
				class="donut"
				style={{ background: `conic-gradient(${gradient()})` }}
			>
				<div class="donut-hole">
					<strong>{props.total}</strong>
					<span>kegiatan</span>
				</div>
			</div>
			<div class="category-legend">
				<For each={props.data}>
					{(item) => (
						<div>
							<span>
								<i style={{ background: item.color }} />
								{item.key}
							</span>
							<strong>
								{item.count}{" "}
								<small>({Math.round((item.count / total()) * 100)}%)</small>
							</strong>
						</div>
					)}
				</For>
			</div>
		</div>
	);
}
function LocationChart(props) {
	const max = () => Math.max(...props.data.map((item) => item.count), 1);
	return (
		<div class="division-chart">
			<div class="bar-grid">
				<span>Kegiatan</span>
				<span>{max()}</span>
				<span>{Math.ceil(max() * 0.75)}</span>
				<span>{Math.ceil(max() * 0.5)}</span>
				<span>{Math.ceil(max() * 0.25)}</span>
				<span>0</span>
			</div>
			<div class="bars">
				<For each={props.data}>
					{(item) => (
						<div class="bar-column">
							<div class="bar-value">{item.count}</div>
							<div
								class="bar"
								style={{
									height: `${Math.max(7, (item.count / max()) * 150)}px`,
								}}
							/>
							<span>{item.label}</span>
						</div>
					)}
				</For>
			</div>
		</div>
	);
}
function StatusChart(props) {
	return (
		<div class="status-chart">
			<For each={props.data}>
				{(item) => (
					<div class="status-row">
						<div>
							<span>{item.key}</span>
							<strong>{item.count}</strong>
						</div>
						<div class="status-track">
							<span
								style={{
									width: `${props.total ? (item.count / props.total) * 100 : 0}%`,
									background: item.color,
								}}
							/>
						</div>
					</div>
				)}
			</For>
			<button type="button" class="detail-action" onClick={props.onDetail}>
				Lihat Detail di Tabel Kegiatan <FiArrowUpRight size={14} />
			</button>
		</div>
	);
}
function EmployeeRanking(props) {
	return (
		<div class="employee-ranking">
			<Show
				when={props.data.length}
				fallback={<div class="empty-chart">Belum ada kontribusi kegiatan.</div>}
			>
				<For each={props.data}>
					{(item, index) => (
						<div class="employee-row">
							<span class="rank">{index() + 1}</span>
							<div class="employee-name">
								<strong>{item.employee.nama}</strong>
								<span>
									{item.employee.divisi || item.employee.unit || "Umum"}
								</span>
							</div>
							<div class="employee-total">
								<strong>{formatNumber(item.hours)} Jam</strong>
								<span>{item.count} Kegiatan</span>
							</div>
						</div>
					)}
				</For>
			</Show>
		</div>
	);
}
function DashboardLoading() {
	return (
		<div class="dashboard-loading">
			<div />
			<div />
			<div />
			<div />
		</div>
	);
}
