import type { BundleSize } from "#src/models/bundleSizes/BundleSize";

// A row `renderBundleSizes` writes, its cells padded however the formatter aligned them. The heading and the separator
// Hold no digits in the bytes cell, so only the rows match
const BUNDLE_SIZE_ROW_REGEX =
  /^\|\s*(?<packageName>[^|]+?)\s*\|\s*(?<file>[^|]+?)\s*\|\s*(?<bytes>\d+)\s*\|\s*[\d.]+\s*\|$/u;

// The rows of a committed record, read back so its sizes can be compared with a fresh build's
export const parseBundleSizes = (markdown: string): BundleSize[] =>
  markdown.split("\n").flatMap((line) => {
    const groups = BUNDLE_SIZE_ROW_REGEX.exec(line)?.groups;
    return groups?.bytes && groups.file && groups.packageName
      ? [{ bytes: Number(groups.bytes), file: groups.file, packageName: groups.packageName }]
      : [];
  });
