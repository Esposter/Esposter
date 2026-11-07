import { BUNDLE_SIZES_FILENAME } from "#src/services/bundleSizes/constants";
import { readBundleSizes } from "#src/services/bundleSizes/readBundleSizes";
import { renderBundleSizes } from "#src/services/bundleSizes/renderBundleSizes";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { timeCommand } from "#src/services/timing/timeCommand";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

timeCommand("bundle-sizes:gen");

const bundleSizes = readBundleSizes(REPOSITORY_ROOT);

writeFileSync(resolve(REPOSITORY_ROOT, BUNDLE_SIZES_FILENAME), renderBundleSizes(bundleSizes));
console.info(
  `${BUNDLE_SIZES_FILENAME}: ${bundleSizes.length} files in ${new Set(bundleSizes.map(({ packageName }) => packageName)).size} packages`,
);
