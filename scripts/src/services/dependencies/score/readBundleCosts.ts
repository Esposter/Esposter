import type { BundleCost } from "#src/models/dependencies/score/BundleCost";
import type { BundleScope } from "#src/models/dependencies/score/BundleScope";
import type { ImportStatement } from "#src/models/dependencies/score/ImportStatement";
import type { InstalledPackage } from "#src/models/dependencies/score/InstalledPackage";
import type { PackageManifest } from "@esposter/configuration";

import {
  APP_DIRECTORY,
  BUNDLE_CONCURRENCY,
  BUNDLE_ENTRY_DIRECTORY_NAME,
  NODE_MODULES_DIRECTORY,
  TEST_FILE_REGEX,
} from "#src/services/dependencies/score/constants";
import { checkIsClientPath } from "#src/services/dependencies/score/checkIsClientPath";
import { checkIsNuxtModule } from "#src/services/dependencies/score/checkIsNuxtModule";
import { createBundleEntry } from "#src/services/dependencies/score/createBundleEntry";
import { getBundleSkipReason } from "#src/services/dependencies/score/getBundleSkipReason";
import { getImportedPackageName } from "#src/services/dependencies/score/parseImportLines";
import { measureBundleBytes } from "#src/services/dependencies/score/measureBundleBytes";
import { parseImportStatements } from "#src/services/dependencies/score/parseImportStatements";
import { PACKAGE_JSON_FILENAME, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { forEachConcurrently } from "#src/services/shared/forEachConcurrently";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getOrCreate, getResultAsync, takeOne } from "@esposter/shared";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

// The client folders' import statements of each file, read once however many packages the file imports
const readStatements = (path: string, pathStatementsMap: Map<string, ImportStatement[]>): ImportStatement[] =>
  getOrCreate(pathStatementsMap, path, () => parseImportStatements(readFileSync(join(REPOSITORY_ROOT, path), "utf8")));

// Every catalog package's gzipped bytes in the app's client bundle, measured from the statements its client importers make
// Of it, or the reason it is not measured. Each bundle's temporary entry sits under the `node_modules` of its first
// Importer, so the package resolves exactly as that importer does, and is removed once every bundle is measured.
export const readBundleCosts = async (
  packageNames: string[],
  packageNameInstalledMap: Map<string, InstalledPackage>,
  packageNameImportersMap: Map<string, Set<string>>,
  clientDirectories: string[],
): Promise<Map<string, BundleCost>> => {
  const { dependencies = {} } = parseMachineJson<PackageManifest>(
    readFileSync(resolve(REPOSITORY_ROOT, APP_DIRECTORY, PACKAGE_JSON_FILENAME), "utf8"),
  );
  const appDependencyNames = new Set(Object.keys(dependencies));
  const pathStatementsMap = new Map<string, ImportStatement[]>();
  const packageNameBundleCostMap = new Map<string, BundleCost>();
  const entryDirectories = new Set<string>();

  const measurePackage = async (packageName: string): Promise<BundleCost> => {
    const importerPaths = [...(packageNameImportersMap.get(packageName) ?? [])].toSorted();
    const clientPaths = importerPaths.filter((path) => checkIsClientPath(path, clientDirectories));
    const valueClientPaths = clientPaths.filter((path) => !TEST_FILE_REGEX.test(path));
    const statements = valueClientPaths
      .flatMap((path) => readStatements(path, pathStatementsMap))
      .filter(({ specifier }) => getImportedPackageName(specifier) === packageName);
    const valueStatements = statements.filter(({ isTypeOnly }) => !isTypeOnly);

    const scope: BundleScope = {
      clientImporterCount: clientPaths.length,
      importerCount: importerPaths.length,
      isNuxtModule: checkIsNuxtModule(packageName),
      isTypesOnly: statements.length > 0 && valueStatements.length === 0,
      packageName,
      valueClientImporterCount: valueClientPaths.length,
    };
    const skipReason = getBundleSkipReason(scope);
    if (skipReason !== undefined) return { bytes: 0, skipReason };

    const installed = packageNameInstalledMap.get(packageName);
    if (installed === undefined) return { bytes: 0, skipReason: "not installed" };

    // A peer the app already ships is external, so it is not counted in the package's own bundle
    const externals = Object.keys(installed.manifest.peerDependencies ?? {}).filter((name) =>
      appDependencyNames.has(name),
    );
    const entryDirectory = join(
      REPOSITORY_ROOT,
      dirname(takeOne(valueClientPaths, 0)),
      NODE_MODULES_DIRECTORY,
      BUNDLE_ENTRY_DIRECTORY_NAME,
    );
    const entryPath = join(entryDirectory, `${packageName.replaceAll("/", "__")}.js`);
    entryDirectories.add(entryDirectory);
    mkdirSync(entryDirectory, { recursive: true });
    writeFileSync(entryPath, createBundleEntry(valueStatements));

    const result = await getResultAsync(() => measureBundleBytes(entryPath, externals));
    rmSync(entryPath, { force: true });
    return result.match(
      (bytes) => ({ bytes, skipReason: "" }),
      ({ message }) => {
        const [firstLine = ""] = message.split("\n");
        return { bytes: 0, skipReason: `failed: ${firstLine}` };
      },
    );
  };

  await forEachConcurrently(packageNames, BUNDLE_CONCURRENCY, async (packageName) => {
    packageNameBundleCostMap.set(packageName, await measurePackage(packageName));
  });
  for (const entryDirectory of entryDirectories) rmSync(entryDirectory, { force: true, recursive: true });

  return packageNameBundleCostMap;
};
