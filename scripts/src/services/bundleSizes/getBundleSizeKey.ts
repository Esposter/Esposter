import type { BundleSize } from "#src/models/bundleSizes/BundleSize";

// A row's identity in a record, its package and its file and never its bytes, so two records compare row by row
export const getBundleSizeKey = ({ file, packageName }: BundleSize): string => `${packageName}\n${file}`;
