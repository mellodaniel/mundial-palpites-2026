import { formatDateTimeInTimezone } from './timezone';

export function formatPortugalDateTime(date: string) {
  return formatDateTimeInTimezone(date, 'Europe/Lisbon');
}

export function isMatchLocked(kickoffUtc: string) {
  return new Date() >= new Date(kickoffUtc);
}