import { KIBIBYTE } from "#src/constants";
import { statSync } from "node:fs";
import { basename, resolve } from "node:path";

// The line every package's bundle-size suite snapshots. The unit is fixed at KB rather than scaled into the
// Largest one that fits — a multi-megabyte bundle renders as four digits of KB on purpose, so two snapshots are
// Compared by reading them rather than by converting one of them first. The raw byte count is kept beside it
// Because that is what an inline snapshot diff shows moving.
export const getFileSizeReport = (targetPath: string): string => {
  const absolutePath = resolve(targetPath);
  const { size } = statSync(absolutePath);
  return `${basename(absolutePath)}: ${(size / KIBIBYTE).toFixed(2)} KB (${size} bytes)`;
};
