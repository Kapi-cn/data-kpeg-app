import { FiMenu } from "solid-icons/fi";
import icon from "../../assets/icon.svg";

import { toggleSidebar } from "../../stores/sidebar-store";

const timeOfDayClasses = {
	pagi: "text-slate-700",
	siang: "text-slate-700",
	sore: "text-slate-700",
	malam: "text-slate-700",
};

const normalizeRole = (role) => {
	if (!role) return "Admin";

	const normalizedRole = String(role).trim().toLowerCase();

	if (normalizedRole === "admin") return "Admin";
	if (normalizedRole === "staff") return "Staff";
	if (normalizedRole === "operator") return "Operator";

	return String(role).trim();
};

const getTimeOfDay = () => {
	const hour = new Date().getHours();

	if (hour >= 5 && hour < 11) return "pagi";
	if (hour >= 11 && hour < 15) return "siang";
	if (hour >= 15 && hour < 18) return "sore";
	return "malam";
};

export default function Header(props) {
	const today = new Date().toLocaleDateString("id-Id", {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric",
	});

	const currentUser = () => props.user;
	const timeOfDay = getTimeOfDay();
	const greetingText = () => {
		const role = normalizeRole(currentUser()?.role);
		const greetings = {
			pagi: "Selamat Pagi",
			siang: "Selamat Siang",
			sore: "Selamat Sore",
			malam: "Selamat Malam",
		};

		return `${greetings[timeOfDay]}, ${role}`;
	};

	return (
		<header class=":uno: flex items-center z-10 layout-light bg-[var(--surface)] sticky h-16 top-0">
			<div class=":uno: flex items-center w-full justify-between gap-5 px-5 py-3">
				<button
					type="button"
					onClick={toggleSidebar}
					class=":uno: md:hidden rounded-md text-[var(--text-muted)] transition-colors ease-in duration-200 hover:(bg-[var(--surface-alt)] text-[var(--text)]/80) p-1"
				>
					<FiMenu size={24} stroke-width={2} />
				</button>

				<div class=":uno: md:hidden ">
					<div class=":uno: flex items-center gap-2">
						<img src={icon} width={28} height={28} alt="" aria-hidden="true" />
						<span
							aria-hidden="true"
							class=":uno: font-semibold text-md leading-5 text-[var(--title)]"
						>
							Kegiatan Pegawai BPMPTP
						</span>
					</div>
				</div>

				<div class=":uno: hidden md:flex items-center gap-2">
					<span
						class={`:uno: text-xl font-extrabold ${timeOfDayClasses[timeOfDay]}`}
					>
						{greetingText()}
					</span>
					<span class=":uno: text-2xl" aria-hidden="true">
						👋
					</span>
				</div>

				<div class=":uno: ml-auto flex items-center gap-3">
					<div class=":uno: flex items-center gap-2 hidden sm:block text-xs">
						<span class=":uno: font-mono tracking-tighter text-[var(--text-muted)]/90">
							{today}
						</span>
					</div>

					<div class=":uno: h-5 w-px bg-[var(--border)] md:hidden" />
				</div>
			</div>
		</header>
	);
}
