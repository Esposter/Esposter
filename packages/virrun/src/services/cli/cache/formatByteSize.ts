import { KIBIBYTE } from "@esposter/shared";

const BYTE_UNITS = ["B", "KiB", "MiB", "GiB", "TiB"] as const;
// Human-readable binary byte size for `cache ls` (e.g. 1536 → "1.5 KiB"). Pure: scales into the largest unit whose
// Value is at least 1, one decimal place above bytes (whole bytes have no fraction). Caps at TiB so an absurd total
// Still renders. Negative/NaN inputs are clamped to 0 B — the caller only ever passes a non-negative directory total.
export const formatByteSize = (bytes: number): string => {
  if (!(bytes > 0)) return `0 ${BYTE_UNITS[0]}`;
  let value = bytes;
  let unitIndex = 0;
  while (value >= KIBIBYTE && unitIndex < BYTE_UNITS.length - 1) {
    value /= KIBIBYTE;
    unitIndex += 1;
  }
  const rendered = unitIndex === 0 ? String(value) : value.toFixed(1);
  return `${rendered} ${BYTE_UNITS[unitIndex]}`;
};
