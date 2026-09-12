import { REPOSITORY_ROOT } from "#src/services/constants";
import { getSweepFilePaths } from "#src/services/sweeps/getSweepFilePaths";
import { MINIMUM_CONSUMER_PACKAGES } from "#src/services/sweeps/sharedExportConsumers/constants";
import { getConsumerPackagePaths } from "#src/services/sweeps/sharedExportConsumers/getConsumerPackagePaths";
import { getExportNames } from "#src/services/sweeps/sharedExportConsumers/getExportNames";
import { getPackageIdentifiersMap } from "#src/services/sweeps/sharedExportConsumers/getPackageIdentifiersMap";
import { getPackagePath } from "#src/services/sweeps/sharedExportConsumers/getPackagePath";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sourcePaths = getSweepFilePaths("packages/shared/src/*.ts").filter(
  (path) => !path.includes(".test.") && !path.endsWith("index.ts"),
);
// Every file outside the defining package. `packages/shared` naming its own export is the library using itself,
// So counting it would let one real consumer clear a threshold that asks for two.
const packageIdentifiersMap = getPackageIdentifiersMap(
  [...getSweepFilePaths("*.ts"), ...getSweepFilePaths("*.vue")]
    .filter((path) => !path.includes("/dist/") && getPackagePath(path) !== "packages/shared")
    .map((path) => [path, readFileSync(resolve(REPOSITORY_ROOT, path), "utf8")] as const),
);

// Prints rather than exits non-zero: the ≥2-consumers rule is what earns a place in a shared package, and a `0`
// Here is an export nothing outside `packages/shared` names at all — which may still be a helper the package
// Uses internally, so the pass tells the two apart by opening the file
// (`.agents/ledgers/file-organization.md`).
for (const path of sourcePaths)
  for (const name of getExportNames(readFileSync(resolve(REPOSITORY_ROOT, path), "utf8"))) {
    const consumerPackagePaths = getConsumerPackagePaths(name, packageIdentifiersMap);
    if (consumerPackagePaths.length < MINIMUM_CONSUMER_PACKAGES)
      console.info(`${consumerPackagePaths.length.toString()}  ${path} -> ${name}`);
  }
