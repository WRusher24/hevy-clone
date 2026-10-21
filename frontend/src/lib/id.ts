/** Small collision-resistant id helper (no runtime dependency needed). */
export function uid(prefix = ""): string {
  const cryptoObj: Crypto | undefined =
    typeof globalThis !== "undefined" ? globalThis.crypto : undefined;

  let raw: string;
  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    raw = cryptoObj.randomUUID().replace(/-/g, "").slice(0, 12);
  } else {
    raw = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  }

  return prefix ? `${prefix}_${raw}` : raw;
}

/** Stable slug used for seeded exercise ids so links survive a reset. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
