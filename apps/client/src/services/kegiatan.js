export const getKegiatanAll = async () => {
	const response = await fetch("/api/kegiatan", {
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Gagal mengambil data kegiatan");
	}

	const data = await response.json();

	if (Array.isArray(data)) return data;
	if (Array.isArray(data.data)) return data.data;

	return [];
};

export const createKegiatan = async (payload) => {
	const response = await fetch(`/api/kegiatan`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const err = await response.json().catch(() => ({}));
		throw new Error(err.message || "Gagal membuat kegiatan");
	}

	const data = await response.json();
	return data;
};

export const updateKegiatan = async (id, payload) => {
	const response = await fetch(`/api/kegiatan/${id}`, {
		method: "PUT",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const err = await response.json().catch(() => ({}));
		throw new Error(err.message || "Gagal memperbarui kegiatan");
	}

	return response.json();
};

export const deleteKegiatan = async (id) => {
	const response = await fetch(`/api/kegiatan/${id}`, {
		method: "DELETE",
		credentials: "include",
	});

	if (!response.ok) {
		const err = await response.json().catch(() => ({}));
		throw new Error(err.message || "Gagal menghapus kegiatan");
	}

	return response.json();
};

export const getKegiatanBalaiAll = async () => {
	const response = await fetch("/api/kegiatan-balai", {
		credentials: "include",
	});
	if (!response.ok) throw new Error("Gagal mengambil data kegiatan balai");
	const data = await response.json();
	return Array.isArray(data) ? data : data.data || [];
};

export const createKegiatanBalai = async (payload) => {
	const response = await fetch("/api/kegiatan-balai", {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(error.message || "Gagal menyimpan kegiatan balai");
	}
	return response.json();
};

export const updateKegiatanBalai = async (id, payload) => {
	const response = await fetch(`/api/kegiatan-balai/${id}`, {
		method: "PUT",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!response.ok) throw new Error("Gagal memperbarui kegiatan balai");
	return response.json();
};

export const deleteKegiatanBalai = async (id) => {
	const response = await fetch(`/api/kegiatan-balai/${id}`, {
		method: "DELETE",
		credentials: "include",
	});
	if (!response.ok) throw new Error("Gagal menghapus kegiatan balai");
	return response.json();
};
