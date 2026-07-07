export function truncateText(text: string, maxLen = 50): string {
  if (!text || text.length <= maxLen) return text ?? "";
  return text.slice(0, maxLen) + "…";
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural ?? singular + "s"}`;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}
