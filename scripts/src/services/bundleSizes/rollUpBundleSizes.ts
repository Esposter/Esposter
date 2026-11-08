import type { BundleSize } from "#src/models/bundleSizes/BundleSize";

import { extname } from "node:path";

const DECLARATION_EXTENSION = ".d.ts";

// An unbundled build writes one file per source module, thousands across the packages, and a row for each would bury what
// The record is for: a package whose total moved. A file nested under `dist` is a module, so the modules of one package
// And extension share one row named for the extension, and a file at the root keeps its own
export const rollUpBundleSizes = (bundleSizes: BundleSize[]): BundleSize[] => {
  const rows: BundleSize[] = [];
  const moduleRows = new Map<string, BundleSize>();
  for (const bundleSize of bundleSizes) {
    if (!bundleSize.file.includes("/")) {
      rows.push(bundleSize);
      continue;
    }

    const extension = bundleSize.file.endsWith(DECLARATION_EXTENSION)
      ? DECLARATION_EXTENSION
      : extname(bundleSize.file);
    const file = `**/*${extension}`;
    const key = `${bundleSize.packageName}\n${file}`;
    const moduleRow = moduleRows.get(key);
    if (moduleRow) moduleRow.bytes += bundleSize.bytes;
    else moduleRows.set(key, { bytes: bundleSize.bytes, file, packageName: bundleSize.packageName });
  }
  return [...rows, ...moduleRows.values()];
};
