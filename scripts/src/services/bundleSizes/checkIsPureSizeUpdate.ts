import type { BundleSize } from "#src/models/bundleSizes/BundleSize";

import { getBundleSizeKey } from "#src/services/bundleSizes/getBundleSizeKey";

// Whether `next` holds exactly the rows of `previous`, each at whatever size it now is. A record that only moves bytes
// Is the build's growth or shrink, while one that gains, loses or renames a row means a package or an entry appeared or
// Went, which the record's commit names apart from a size update
export const checkIsPureSizeUpdate = (previous: BundleSize[], next: BundleSize[]): boolean => {
  const previousKeys = new Set(previous.map((row) => getBundleSizeKey(row)));
  const nextKeys = new Set(next.map((row) => getBundleSizeKey(row)));
  return previousKeys.size === nextKeys.size && [...nextKeys].every((key) => previousKeys.has(key));
};
