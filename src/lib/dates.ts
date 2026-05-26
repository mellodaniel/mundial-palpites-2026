export function formatPortugalDateTime(date: string) {
    return new Intl.DateTimeFormat('pt-PT', {
      timeZone: 'Europe/Lisbon',
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(date));
  }
  
  export function isMatchLocked(kickoffUtc: string) {
    return new Date() >= new Date(kickoffUtc);
  }