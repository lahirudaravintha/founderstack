export function toISOString(date: Date): string {
  return date.toISOString();
}

export function fromISOString(iso: string): Date {
  return new Date(iso);
}

export function isExpired(date: Date): boolean {
  return date.getTime() < Date.now();
}
