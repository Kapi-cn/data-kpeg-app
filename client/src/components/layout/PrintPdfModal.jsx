import { Show, createSignal, createEffect } from 'solid-js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FiX, FiPrinter, FiFileText, FiDownload, FiCalendar } from 'solid-icons/fi';

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatStatus = (status) => {
  const value = String(status || '').trim();
  const map = {
    terjadwal: 'Rencana',
    rencana: 'Rencana',
    berlangsung: 'Berlangsung',
    selesai: 'Selesai',
    dibatalkan: 'Dibatalkan',
  };

  return map[value.toLowerCase()] || value || 'Rencana';
};

const formatMonthLabel = (monthValue) => {
  if (!monthValue) return 'Bulan ini';

  const date = new Date(`${monthValue}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Bulan ini';

  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
};

export default function PrintPdfModal(props) {
  const [selectedMonth, setSelectedMonth] = createSignal(props.monthValue || new Date().toISOString().slice(0, 7));

  createEffect(() => {
    if (props.monthValue) {
      setSelectedMonth(props.monthValue);
    }
  });

  const handleMonthChange = (event) => {
    const value = event.currentTarget.value;
    setSelectedMonth(value);
    props.onMonthChange?.(value);
  };

  const handlePrint = () => {
    const reportItems = Array.isArray(props.items) ? props.items : [];
    const filteredItems = selectedMonth()
      ? reportItems.filter((item) => {
          const itemDate = item?.waktu_mulai ? new Date(item.waktu_mulai) : null;
          if (!itemDate || Number.isNaN(itemDate.getTime())) return false;
          const itemMonth = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
          return itemMonth === selectedMonth();
        })
      : reportItems;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const tableWidth = 640;
    const horizontalMargin = (pageWidth - tableWidth) / 2;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('LAPORAN KEGIATAN PEGAWAI BPMPTP', pageWidth / 2, 36, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Periode Laporan: ${formatMonthLabel(selectedMonth())}`, pageWidth / 2, 56, { align: 'center' });
    doc.text(
      `Dicetak otomatis oleh Sistem Pengelola Kegiatan Pegawai pada ${new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })}`,
      pageWidth / 2,
      72,
      { align: 'center' },
    );

    const totalKegiatan = filteredItems.length;
    const totalPegawai = filteredItems.reduce(
      (count, item) => count + (Array.isArray(item.pegawai) ? item.pegawai.length : 0),
      0,
    );
    const totalDLT = filteredItems.filter((item) => String(item.kategori || '').toUpperCase() === 'DLT').length;
    const totalTNDP = filteredItems.filter((item) =>
      ['TN', 'DP'].includes(String(item.kategori || '').toUpperCase()),
    ).length;

    const cards = [
      { label: 'TOTAL KEGIATAN', value: totalKegiatan },
      { label: 'PEGAWAI TERLIBAT', value: totalPegawai },
      { label: 'DINAS LUAR KOTA', value: totalDLT },
      { label: 'TUGAS NEGARA & DP', value: totalTNDP },
    ];

    const cardWidth = 150;
    const cardGap = 12;
    const totalCardWidth = cards.length * cardWidth + (cards.length - 1) * cardGap;
    const summaryStartX = (pageWidth - totalCardWidth) / 2;
    const y = 90;

    cards.forEach((card, index) => {
      const x = summaryStartX + index * (cardWidth + cardGap);

      doc.setFillColor(245, 247, 251);
      doc.roundedRect(x, y, cardWidth, 52, 6, 6, 'F');
      doc.setDrawColor(214, 220, 229);
      doc.roundedRect(x, y, cardWidth, 52, 6, 6, 'S');

      doc.setTextColor(90, 100, 116);
      doc.setFontSize(8);
      doc.text(card.label, x + 12, y + 18);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(22);
      doc.text(String(card.value), x + 12, y + 40);
    });

    const tableBody = filteredItems.map((item, index) => {
      const pegawai = (item.pegawai || [])
        .map((peg) => peg.nama || '')
        .filter(Boolean)
        .join('\n');
      return [
        String(index + 1),
        `${formatDate(item.waktu_mulai)}\n${formatTime(item.waktu_mulai)} - ${formatTime(item.waktu_selesai)}`,
        `${item.nama_kegiatan || '-'}\nOutput: ${item.output || '-'}`,
        String(item.kategori || '-'),
        item.lokasi || '-',
        pegawai || '-',
        formatStatus(item.status),
      ];
    });

    autoTable(doc, {
      startY: 160,
      head: [['No', 'Waktu & Tgl', 'Nama Kegiatan & Output', 'Kat.', 'Lokasi', 'Pegawai Pelaksana', 'Status']],
      body: tableBody.length ? tableBody : [['-', '-', 'Belum ada data kegiatan pada bulan ini.', '-', '-', '-', '-']],
      styles: {
        fontSize: 7.5,
        cellPadding: 6,
        valign: 'top',
        lineColor: [214, 220, 229],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [244, 247, 251],
        textColor: [51, 65, 85],
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: {
        0: { cellWidth: 36, halign: 'center' },
        1: { cellWidth: 95 },
        2: { cellWidth: 185 },
        3: { cellWidth: 42, halign: 'center' },
        4: { cellWidth: 115 },
        5: { cellWidth: 125 },
        6: { cellWidth: 60, halign: 'center' },
      },
      tableWidth: tableWidth,
      margin: {
        left: horizontalMargin,
        right: horizontalMargin,
      },
      didDrawPage: () => {
        const pageNumber = doc.getCurrentPageInfo().pageNumber;
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Halaman ${pageNumber}`, pageWidth - 54, pageHeight - 18, { align: 'right' });
      },
    });

    doc.save(`laporan-kegiatan-${selectedMonth() || 'all'}.pdf`);
    props.onPrint?.(selectedMonth());
    props.onClose?.();
  };

  return (
    <Show when={props.open}>
      <div
        class=':uno: fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm'
        onClick={props.onClose}
      >
        <div
          class=':uno: layout-light relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20'
          onClick={(e) => e.stopPropagation()}
        >
          <div class=':uno: flex items-start justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-orange-900 px-6 py-5 text-white'>
            <div class=':uno: pr-4'>
              <div class=':uno: mb-2 flex items-center gap-2'>
                <span class=':uno: inline-flex items-center rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white'>
                  Export Dokumen
                </span>
              </div>

              <h3 class=':uno: text-xl font-bold text-white leading-snug'>{props.title || 'Cetak Laporan PDF'}</h3>
            </div>

            <button
              type='button'
              class=':uno: rounded-xl p-1.5 text-white transition-colors hover:bg-white/10'
              onClick={props.onClose}
              aria-label='Tutup modal cetak'
            >
              <FiX size={18} />
            </button>
          </div>

          <div class=':uno: space-y-5 p-6'>
            <div class=':uno: rounded-2xl border border-orange-100 bg-orange-50/60 p-4'>
              <p class=':uno: text-xs font-semibold text-slate-600'>
                {props.subtitle || 'Siapkan dokumen kegiatan untuk dicetak atau diekspor ke format PDF.'}
              </p>
            </div>

            <div class=':uno: rounded-2xl border border-slate-200 bg-slate-50 p-4'>
              <label class=':uno: mb-2 block text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500'>
                Filter Bulan Kegiatan
              </label>
              <div class=':uno: relative'>
                <span class=':uno: absolute inset-y-0 left-0 flex items-center pl-3 text-orange-500'>
                  <FiCalendar size={14} />
                </span>
                <input
                  type='month'
                  value={selectedMonth()}
                  onInput={handleMonthChange}
                  class=':uno: w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-xs text-slate-800 focus:(border-primary/80 outline-2 outline-primary/20)'
                />
              </div>
            </div>

            <div class=':uno: grid gap-3 sm:grid-cols-2'>
              <div class=':uno: rounded-2xl border border-slate-200 bg-slate-50 p-4'>
                <div class=':uno: mb-3 flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700'>
                  <FiFileText size={18} />
                </div>
                <p class=':uno: text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500'>Format</p>
                <p class=':uno: mt-2 text-sm font-bold text-slate-900'>A4 Portrait</p>
              </div>

              <div class=':uno: rounded-2xl border border-slate-200 bg-slate-50 p-4'>
                <div class=':uno: mb-3 flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700'>
                  <FiDownload size={18} />
                </div>
                <p class=':uno: text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500'>Output</p>
                <p class=':uno: mt-2 text-sm font-bold text-slate-900'>PDF / Print</p>
              </div>
            </div>

            <div class=':uno: rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600'>
              Semua kegiatan yang dilakukan pada bulan{' '}
              <span class=':uno: font-bold text-slate-800'>
                {selectedMonth()
                  ? new Date(`${selectedMonth()}-01T00:00:00`).toLocaleDateString('id-ID', {
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'dipilih'}
              </span>{' '}
              akan dicetak ke dalam dokumen PDF. Pastikan semua data kegiatan sudah lengkap sebelum mengekspor dokumen.
            </div>
          </div>

          <div class=':uno: flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4'>
            <button
              type='button'
              class=':uno: rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-100'
              onClick={props.onClose}
            >
              Batal
            </button>

            <button
              type='button'
              class=':uno: inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-[11px] font-black text-white shadow-md shadow-orange-500/30 transition-colors hover:brightness-105'
              onClick={handlePrint}
            >
              <FiPrinter size={14} />
              Cetak PDF
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
}
