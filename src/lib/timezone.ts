export function getBrowserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Lisbon';
}

export function formatDateTimeInTimezone(date: string, timezone?: string) {
  return new Intl.DateTimeFormat('pt-PT', {
    timeZone: timezone || getBrowserTimezone(),
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date));
}

export function formatDateInTimezone(date: string, timezone?: string) {
  return new Intl.DateTimeFormat('pt-PT', {
    timeZone: timezone || getBrowserTimezone(),
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatTimeInTimezone(date: string, timezone?: string) {
  return new Intl.DateTimeFormat('pt-PT', {
    timeZone: timezone || getBrowserTimezone(),
    timeStyle: 'short',
  }).format(new Date(date));
}

export function getDateKeyInTimezone(date: string, timezone?: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone || getBrowserTimezone(),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(date));

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  return `${year}-${month}-${day}`;
}