import type { DependencyScore } from "#src/models/dependencies/score/DependencyScore";
import type { DependencyScoreReport } from "#src/models/dependencies/score/DependencyScoreReport";
import type { InstalledPackage } from "#src/models/dependencies/score/InstalledPackage";
import type { Packument } from "#src/models/dependencies/score/Packument";
import type { RegistryCheckError } from "#src/models/outdatedDependencies/shared/RegistryCheckError";

import { ScoreSort } from "#src/models/dependencies/score/ScoreSort";
import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";
import { LEDGER_PATH, NOT_IN_CLIENT_SKIP_REASON, UNJUDGED_VERDICT } from "#src/services/dependencies/score/constants";
import { countDependencyLines } from "#src/services/dependencies/score/countDependencyLines";
import { countModuleGraphLines } from "#src/services/dependencies/score/countModuleGraphLines";
import { countRecentReleases } from "#src/services/dependencies/score/countRecentReleases";
import { findInstalledPackage } from "#src/services/dependencies/score/findInstalledPackage";
import { getClientBundleBytes } from "#src/services/dependencies/score/getClientBundleBytes";
import { getDisagreements } from "#src/services/dependencies/score/getDisagreements";
import { getFormatPoints } from "#src/services/dependencies/score/getFormatPoints";
import { getPackageFormat } from "#src/services/dependencies/score/getPackageFormat";
import { getSelfContainmentPoints } from "#src/services/dependencies/score/getSelfContainmentPoints";
import { getSizePoints } from "#src/services/dependencies/score/getSizePoints";
import { getStabilityPoints } from "#src/services/dependencies/score/getStabilityPoints";
import { getWorkspacePackages } from "#src/services/dependencies/score/getWorkspacePackages";
import { readClientBundleReport } from "#src/services/dependencies/score/readClientBundleReport";
import { readImportingFiles } from "#src/services/dependencies/score/readImportingFiles";
import { readInstallCosts } from "#src/services/dependencies/score/readInstallCosts";
import { readLedgerVerdicts } from "#src/services/dependencies/score/readLedgerVerdicts";
import { readTypeShims } from "#src/services/dependencies/score/readTypeShims";
import { getManifestDependencies } from "#src/services/outdatedDependencies/manifest/getManifestDependencies";
import { REGISTRY_CONCURRENCY } from "#src/services/outdatedDependencies/registry/constants";
import { getSection } from "#src/services/outdatedDependencies/workspace/getSection";
import { parseWorkspaceEntries } from "#src/services/outdatedDependencies/workspace/parseWorkspaceEntries";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { fetchRegistry } from "#src/services/shared/fetchRegistry";
import { forEachConcurrently } from "#src/services/shared/forEachConcurrently";
import { readManifestFiles } from "#src/services/shared/readManifestFiles";
import { WORKSPACE_FILE } from "@esposter/configuration";
import { getOrCreate, getResultAsync } from "@esposter/shared";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// The latest release, the one a `latest` install gets, is deprecated: a flag on the row, never a score
const checkIsLatestDeprecated = ({ "dist-tags": distTags, versions }: Packument): boolean => {
  const latestVersion = distTags.latest;
  return latestVersion !== undefined && Boolean(versions[latestVersion]?.deprecated);
};

const readPackuments = async (
  packageNames: string[],
): Promise<{ errors: RegistryCheckError[]; packuments: Map<string, Packument> }> => {
  const errors: RegistryCheckError[] = [];
  const packuments = new Map<string, Packument>();

  await forEachConcurrently(packageNames, REGISTRY_CONCURRENCY, async (packageName) => {
    await getResultAsync(() => fetchRegistry<Packument>(packageName)).match(
      (packument) => {
        packuments.set(packageName, packument);
      },
      (error) => {
        errors.push({ error: error.message, packageName });
      },
    );
  });

  return { errors, packuments };
};

// Every catalog entry's score, read from the catalog, the ledger, each installed copy, the registry, the tracked source
// And the app's client bundle, sorted by the score or by the bundle cost the sort names
export const readDependencyScores = async (sort: ScoreSort): Promise<DependencyScoreReport> => {
  const workspaceYaml = readFileSync(resolve(REPOSITORY_ROOT, WORKSPACE_FILE), "utf8");
  const catalogEntries = parseWorkspaceEntries(
    DependencyGroup.Catalog,
    getSection(DependencyGroup.Catalog, workspaceYaml),
  );
  const packageNameVerdictMap = readLedgerVerdicts(readFileSync(resolve(REPOSITORY_ROOT, LEDGER_PATH), "utf8"));
  const manifestFiles = readManifestFiles(REPOSITORY_ROOT);
  const packageNameManifestPathsMap = new Map<string, Set<string>>();
  for (const { manifestPath, packageName } of getManifestDependencies(manifestFiles))
    getOrCreate(packageNameManifestPathsMap, packageName, () => new Set<string>()).add(manifestPath);
  const packageNameImportersMap = readImportingFiles();
  const packageNameShimCountMap = readTypeShims();
  const today = Temporal.Now.plainDateISO();

  const packageNameInstalledMap = new Map<string, InstalledPackage>();
  for (const { packageName } of catalogEntries) {
    const installed = findInstalledPackage(packageName, [...(packageNameManifestPathsMap.get(packageName) ?? [])]);
    if (installed !== undefined) packageNameInstalledMap.set(packageName, installed);
  }
  const packageNames = catalogEntries.map(({ packageName }) => packageName);
  const { ageMilliseconds, report } = readClientBundleReport();
  const packageNameBundleBytesMap = getClientBundleBytes(report, getWorkspacePackages(manifestFiles));
  const packageNameInstallCostMap = readInstallCosts(packageNameInstalledMap);

  const { errors, packuments } = await readPackuments(packageNames);
  const scores: DependencyScore[] = [];
  const unresolvedPackageNames: string[] = [];

  for (const { packageName } of catalogEntries) {
    const manifestPaths = [...(packageNameManifestPathsMap.get(packageName) ?? [])];
    const installed = packageNameInstalledMap.get(packageName);
    const packument = packuments.get(packageName);
    if (installed === undefined) unresolvedPackageNames.push(packageName);

    const sourceLines = installed === undefined ? 0 : countModuleGraphLines(installed.directory, installed.manifest);
    const selfContainmentCount = Object.keys(installed?.manifest.dependencies ?? {}).length;
    const releaseCount = packument === undefined ? 0 : countRecentReleases(packument.time, today);
    const sizePoints = installed === undefined ? 0 : getSizePoints(sourceLines);
    const formatPoints = installed === undefined ? 0 : getFormatPoints(getPackageFormat(installed.manifest));
    const selfContainmentPoints = installed === undefined ? 0 : getSelfContainmentPoints(selfContainmentCount);
    const stabilityPoints = packument === undefined ? 0 : getStabilityPoints(releaseCount);
    const importers = packageNameImportersMap.get(packageName);
    const installCost = packageNameInstallCostMap.get(packageName);
    const bundleBytes = packageNameBundleBytesMap.get(packageName);

    scores.push({
      bundleBytes: bundleBytes?.bytes ?? 0,
      bundleSkipReason: bundleBytes ? "" : NOT_IN_CLIENT_SKIP_REASON,
      dependencyLines: installed === undefined ? 0 : countDependencyLines(packageName, installed),
      entryBytes: bundleBytes?.entryBytes ?? 0,
      formatPoints,
      importerCount: importers?.size ?? 0,
      installBytes: installCost?.bytes ?? 0,
      isDeprecated: packument !== undefined && checkIsLatestDeprecated(packument),
      isInstallShared: installCost?.isShared ?? false,
      manifestCount: manifestPaths.length,
      packageName,
      releaseCount,
      selfContainmentPoints,
      shimCount: packageNameShimCountMap.get(packageName) ?? 0,
      sizePoints,
      sourceLines,
      stabilityPoints,
      total: sizePoints + stabilityPoints + formatPoints + selfContainmentPoints,
      verdict: packageNameVerdictMap.get(packageName) ?? UNJUDGED_VERDICT,
    });
  }

  const sortedScores = scores.toSorted(
    (left, right) =>
      (sort === ScoreSort.Bundle ? right.bundleBytes - left.bundleBytes : right.total - left.total) ||
      left.packageName.localeCompare(right.packageName),
  );
  return {
    bundleReportAgeMilliseconds: ageMilliseconds,
    disagreements: getDisagreements(sortedScores),
    errors: errors.toSorted((left, right) => left.packageName.localeCompare(right.packageName)),
    scores: sortedScores,
    unresolvedPackageNames,
  };
};
