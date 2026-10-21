/**
 * Token based search: every whitespace-separated term must appear in at least
 * one of the haystack fields. "cable bench" matches "Barbell Bench Press" only
 * if both tokens are present, which is what users expect from a library search.
 */
export function matchesQuery(fields: string[], query: string): boolean {
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  const haystack = fields.join(" ").toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}
