import { BUNDLE_SIZES_FILENAME } from "#src/services/bundleSizes/constants";
import { readBundleSizes } from "#src/services/bundleSizes/readBundleSizes";
import { renderBundleSizes } from "#src/services/bundleSizes/renderBundleSizes";
import { settleBundleSizes } from "#src/services/bundleSizes/settleBundleSizes";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { timeCommand } from "#src/services/timing/timeCommand";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

timeCommand("bundle-sizes:gen");

const bundleSizesPath = resolve(REPOSITORY_ROOT, BUNDLE_SIZES_FILENAME);
const record = existsSync(bundleSizesPath) ? readFileSync(bundleSizesPath, "utf8") : "";
const bundleSizes = settleBundleSizes(readBundleSizes(REPOSITORY_ROOT), record);

writeFileSync(bundleSizesPath, renderBundleSizes(bundleSizes));
console.info(
  `${BUNDLE_SIZES_FILENAME}: ${bundleSizes.length} files in ${new Set(bundleSizes.map(({ packageName }) => packageName)).size} packages`,
);
