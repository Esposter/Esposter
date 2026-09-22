import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";
import { getMismatches } from "#src/services/outdatedDependencies/getMismatches";
import { getLockCatalogVersions } from "#src/services/outdatedDependencies/lock/getLockCatalogVersions";
import { getLockConfigDependencyVersions } from "#src/services/outdatedDependencies/lock/getLockConfigDependencyVersions";
import { getEngineEntries } from "#src/services/outdatedDependencies/manifest/getEngineEntries";
import { getManifestDependencies } from "#src/services/outdatedDependencies/manifest/getManifestDependencies";
import { getManifestFiles } from "#src/services/outdatedDependencies/manifest/getManifestFiles";
import { getUncatalogedManifestDependencies } from "#src/services/outdatedDependencies/manifest/getUncatalogedManifestDependencies";
import { readNpmProjects } from "#src/services/outdatedDependencies/npm/readNpmProjects";
import { getRegularOutdatedDependencies } from "#src/services/outdatedDependencies/pnpm/getRegularOutdatedDependencies";
import { omitDependents } from "#src/services/outdatedDependencies/pnpm/omitDependents";
import { createColor } from "#src/services/outdatedDependencies/print/createColor";
import { printExecutionTime } from "#src/services/outdatedDependencies/print/printExecutionTime";
import { printHeldDependencies } from "#src/services/outdatedDependencies/print/printHeldDependencies";
import { printMismatches } from "#src/services/outdatedDependencies/print/printMismatches";
import { printOutdatedDependencies } from "#src/services/outdatedDependencies/print/printOutdatedDependencies";
import { printRegistryErrors } from "#src/services/outdatedDependencies/print/printRegistryErrors";
import { printUncatalogedManifestDependencies } from "#src/services/outdatedDependencies/print/printUncatalogedManifestDependencies";
import { readRegistryOutdatedDependencies } from "#src/services/outdatedDependencies/registry/readRegistryOutdatedDependencies";
import { getFollowedTagEntries } from "#src/services/outdatedDependencies/renovate/getFollowedTagEntries";
import { getRenovateRules } from "#src/services/outdatedDependencies/renovate/getRenovateRules";
import { partitionHeldDependencies } from "#src/services/outdatedDependencies/renovate/partitionHeldDependencies";
import { getSection } from "#src/services/outdatedDependencies/workspace/getSection";
import { parseWorkspaceEntries } from "#src/services/outdatedDependencies/workspace/parseWorkspaceEntries";
import { LOCKFILE_PATH, RENOVATE_CONFIGURATION_FILE, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { WORKSPACE_FILE } from "@esposter/configuration";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const startedAt = performance.now();
const color = createColor(!process.env.NO_COLOR);

const workspaceYaml = readFileSync(resolve(REPOSITORY_ROOT, WORKSPACE_FILE), "utf8");
const lockYaml = readFileSync(LOCKFILE_PATH, "utf8");
const renovateJson = readFileSync(resolve(REPOSITORY_ROOT, RENOVATE_CONFIGURATION_FILE), "utf8");

const catalogEntries = parseWorkspaceEntries(
  DependencyGroup.Catalog,
  getSection(DependencyGroup.Catalog, workspaceYaml),
);
const configDependencyEntries = parseWorkspaceEntries(
  DependencyGroup.ConfigDependencies,
  getSection(DependencyGroup.ConfigDependencies, workspaceYaml),
);
const manifests = getManifestFiles(REPOSITORY_ROOT);
const npmProjects = readNpmProjects(REPOSITORY_ROOT);
const npmManifestPaths = new Set(npmProjects.map(({ manifestPath }) => manifestPath));
const npmManifestNames = new Set(npmProjects.map(({ manifestName }) => manifestName));
const npmEntries = npmProjects.flatMap(({ entries }) => entries);
const engineEntries = getEngineEntries(manifests);
const manifestDependencies = getManifestDependencies(manifests);
const uncatalogedManifestDependencies = getUncatalogedManifestDependencies(manifestDependencies, npmManifestPaths);
const mismatches = [
  ...getMismatches(catalogEntries, getLockCatalogVersions(lockYaml)),
  ...getMismatches(configDependencyEntries, getLockConfigDependencyVersions(lockYaml)),
  ...npmProjects.flatMap(({ entries, resolvedVersions }) => getMismatches(entries, resolvedVersions)),
];

printUncatalogedManifestDependencies(uncatalogedManifestDependencies, color);
printMismatches(mismatches, color);

const renovateRules = getRenovateRules(renovateJson);
// `pnpm outdated` compares against `latest`, which is not what Renovate proposes for a package a rule follows a
// Dist-tag for, so those catalog entries are asked of the registry under their tag instead.
const followedTagEntries = getFollowedTagEntries(catalogEntries, renovateRules);
const followedPackages = new Set(followedTagEntries.map(({ packageName }) => packageName));
const [regularChecks, registryChecks] = await Promise.all([
  getRegularOutdatedDependencies(REPOSITORY_ROOT),
  readRegistryOutdatedDependencies([
    ...configDependencyEntries,
    ...engineEntries,
    ...followedTagEntries,
    ...npmEntries,
  ]),
]);
// A version Renovate would not propose is not a bump to take by hand either: the two readers share one policy.
const { held, outdated } = partitionHeldDependencies(
  [
    ...omitDependents(
      regularChecks.outdatedDependencies.filter(({ packageName }) => !followedPackages.has(packageName)),
      npmManifestNames,
    ),
    ...registryChecks.outdatedDependencies,
  ],
  renovateRules,
);
const errors = [...regularChecks.errors, ...registryChecks.errors];
const hasBlockingIssues = uncatalogedManifestDependencies.length > 0 || errors.length > 0;
printOutdatedDependencies(outdated, color);
printHeldDependencies(held, color);
printRegistryErrors(errors, color);
printExecutionTime(startedAt);
if (hasBlockingIssues) process.exitCode = 1;
