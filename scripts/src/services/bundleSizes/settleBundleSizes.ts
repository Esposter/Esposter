import type { BundleSize } from "#src/models/bundleSizes/BundleSize";

import { CHECKOUT_DEPENDENT_FILES, CHECKOUT_DEPENDENT_TOLERANCE_BYTES } from "#src/services/bundleSizes/constants";

const ROW_REGEX = /^\| (?<packageName>[^|]+?) +\| (?<file>[^|]+?) +\| +(?<bytes>\d+) +\|/gmu;

// A checkout-dependent file keeps its recorded size when the build is within the tolerance of it, so building the same
// Source in another folder neither fails the check nor rewrites the record. Every other file is exactly what was built
export const settleBundleSizes = (bundleSizes: BundleSize[], record: string): BundleSize[] => {
  const recordedBytes = new Map<string, number>();
  for (const { groups } of record.matchAll(ROW_REGEX))
    if (groups) recordedBytes.set(`${groups.packageName}/${groups.file}`, Number(groups.bytes));

  return bundleSizes.map((bundleSize) => {
    const key = `${bundleSize.packageName}/${bundleSize.file}`;
    const recorded = recordedBytes.get(key);
    return recorded !== undefined &&
      CHECKOUT_DEPENDENT_FILES.has(key) &&
      Math.abs(bundleSize.bytes - recorded) <= CHECKOUT_DEPENDENT_TOLERANCE_BYTES
      ? { ...bundleSize, bytes: recorded }
      : bundleSize;
  });
};
