export const formatDate = (date) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export const formatTime = (date) => {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(date))
}

export const formatKegiatanWaktu = (mulai, selesai) => {
  const start = new Date(mulai)
  const end = new Date(selesai)

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate()

  if (sameDay) {
    return {
      date: formatDate(start),
      time: `${formatTime(start)} - ${formatTime(end)}`,
    }
  }

  return {
    date: `${formatDate(start)} - ${formatDate(end)}`,
    time: `${formatTime(start)} - ${formatTime(end)}`,
  }
}

export const toLocalDateTimeInput = (date) => {
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().slice(0, 16);
}