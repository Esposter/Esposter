import type { SharedExportFinding } from "#src/models/sweeps/sharedExportConsumers/SharedExportFinding";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { MINIMUM_CONSUMER_PACKAGES } from "#src/services/sweeps/sharedExportConsumers/constants";
import { getBarrelPaths } from "#src/services/sweeps/sharedExportConsumers/getBarrelPaths";
import { getConsumerPackagePaths } from "#src/services/sweeps/sharedExportConsumers/getConsumerPackagePaths";
import { getExportNames } from "#src/services/sweeps/sharedExportConsumers/getExportNames";
import { getIdentifiers } from "#src/services/sweeps/sharedExportConsumers/getIdentifiers";
import { getPackageIdentifiersMap } from "#src/services/sweeps/sharedExportConsumers/getPackageIdentifiersMap";
import { getPackagePath } from "#src/services/sweeps/sharedExportConsumers/getPackagePath";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SHARED_PACKAGE_PATH = "packages/shared";
const SHARED_BARREL_PATH = `${SHARED_PACKAGE_PATH}/src/index.ts`;

const readSource = (path: string): readonly [string, string] =>
  [path, readFileSync(resolve(REPOSITORY_ROOT, path), "utf8")] as const;
// Every export of `packages/shared` that the ≥2-consumers rule does not earn a place there: named by one package
// Outside it and by nothing else in it, so it belongs beside that consumer; or named by nothing anywhere, so it is
// Dead. An export the package's other files name stays whatever the count — it is a piece of an export that does clear
// The threshold, and the rule is about packages, not files. The dead check is kept only for the files the barrel
// Re-exports, which knip's default run skips as entry exports; knip reports the rest's unused exports itself.
export const readSharedExportFindings = (): SharedExportFinding[] => {
  const barrelPaths = getBarrelPaths(readSource(SHARED_BARREL_PATH)[1]);
  const sharedFiles = readSweepFilePaths(`${SHARED_PACKAGE_PATH}/src/*.ts`)
    .filter((path) => !path.endsWith("index.ts"))
    .map((path) => readSource(path));
  const sharedSources = sharedFiles.filter(([path]) => !path.includes(".test."));
  // A suite of the package reads an export as much as a source file does: a fixture shared by one suite here
  // And one in a consumer is used internally, and a suite asserting through a helper keeps that helper home
  const sharedPathIdentifiersMap = new Map(sharedFiles.map(([path, text]) => [path, getIdentifiers(text)] as const));
  // Every file outside the defining package. `packages/shared` naming its own export is the library using itself,
  // So counting it would let one real consumer clear a threshold that asks for two.
  const packageIdentifiersMap = getPackageIdentifiersMap(
    readSweepFilePaths("*.ts", "*.vue")
      .filter((path) => !path.includes("/dist/") && getPackagePath(path) !== SHARED_PACKAGE_PATH)
      .map((path) => readSource(path)),
  );

  return sharedSources.flatMap(([path, text]) =>
    getExportNames(text).flatMap((name) => {
      const consumerPackagePaths = getConsumerPackagePaths(name, packageIdentifiersMap);
      const isUsedInternally = sharedPathIdentifiersMap
        .entries()
        .some(([otherPath, identifiers]) => otherPath !== path && identifiers.has(name));
      if (consumerPackagePaths.length >= MINIMUM_CONSUMER_PACKAGES || isUsedInternally) return [];
      else if (consumerPackagePaths.length === 0 && !barrelPaths.has(path)) return [];
      else return [{ consumerPackagePath: consumerPackagePaths[0], name, path }];
    }),
  );
};
