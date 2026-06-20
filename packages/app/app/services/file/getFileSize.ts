import { takeOne } from "@esposter/shared";
// JEDEC standard: base-1024 magnitudes labelled with decimal SI prefixes (KB/MB/GB...).
const JEDEC_SYMBOLS = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
const KIBIBYTE = 1024;

export const getFileSize = (bytes: number) => {
  if (bytes <= 0) return "0 B";
  let exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(KIBIBYTE)), JEDEC_SYMBOLS.length - 1);
  let value = Number((bytes / KIBIBYTE ** exponent).toFixed(2));
  // Rounding can push the value up to a full unit (e.g. 1023.9 KB -> 1024 KB); promote it.
  if (value === KIBIBYTE && exponent < JEDEC_SYMBOLS.length - 1) {
    value = 1;
    exponent += 1;
  }
  return `${value} ${takeOne(JEDEC_SYMBOLS, exponent)}`;
};
