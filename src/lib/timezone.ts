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
      dateStyle: 'full',
    }).format(new Date(date));
  }
  
  export function formatTimeInTimezone(date: string, timezone?: string) {
    return new Intl.DateTimeFormat('pt-PT', {
      timeZone: timezone || getBrowserTimezone(),
      timeStyle: 'short',
    }).format(new Date(date));
  }
  
  export function getDateKeyInTimezone(date: string, timezone?: string) {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone || getBrowserTimezone(),
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(date));
  }