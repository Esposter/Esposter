import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";
import { applyDistTags } from "#src/services/outdatedDependencies/distTag/applyDistTags";
import { getMismatches } from "#src/services/outdatedDependencies/getMismatches";
import { getRegistryPackageName } from "#src/services/outdatedDependencies/getRegistryPackageName";
import { getLockCatalogVersions } from "#src/services/outdatedDependencies/lock/getLockCatalogVersions";
import { getLockConfigDependencyVersions } from "#src/services/outdatedDependencies/lock/getLockConfigDependencyVersions";
import { getEngineEntries } from "#src/services/outdatedDependencies/manifest/getEngineEntries";
import { getManifestDependencies } from "#src/services/outdatedDependencies/manifest/getManifestDependencies";
import { getPackageManagerEntries } from "#src/services/outdatedDependencies/manifest/getPackageManagerEntries";
import { getUncatalogedManifestDependencies } from "#src/services/outdatedDependencies/manifest/getUncatalogedManifestDependencies";
import { readManifestFiles } from "#src/services/outdatedDependencies/manifest/readManifestFiles";
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
import { printUnpinnedReferences } from "#src/services/outdatedDependencies/print/printUnpinnedReferences";
import { readReferenceScan } from "#src/services/outdatedDependencies/reference/readReferenceScan";
import { readRegistryOutdatedDependencies } from "#src/services/outdatedDependencies/registry/readRegistryOutdatedDependencies";
import { getFollowedTagEntries } from "#src/services/outdatedDependencies/renovate/getFollowedTagEntries";
import { getDisablingRule } from "#src/services/outdatedDependencies/renovate/getDisablingRule";
import { getRenovateRules } from "#src/services/outdatedDependencies/renovate/getRenovateRules";
import { partitionHeldDependencies } from "#src/services/outdatedDependencies/renovate/partitionHeldDependencies";
import { getOverrideEntries } from "#src/services/outdatedDependencies/workspace/getOverrideEntries";
import { getSection } from "#src/services/outdatedDependencies/workspace/getSection";
import { parseWorkspaceEntries } from "#src/services/outdatedDependencies/workspace/parseWorkspaceEntries";
import { DOCKERFILE, GITHUB_DIRECTORY } from "#src/services/outdatedDependencies/reference/constants";
import {
  LOCKFILE_PATH,
  NPM_LOCKFILE,
  RENOVATE_CONFIGURATION_FILE,
  REPOSITORY_ROOT,
} from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { NODE_VERSION_FILENAME } from "#src/services/updateNode/constants";
import { WORKSPACE_FILE } from "@esposter/configuration";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const startedAt = performance.now();
const color = createColor(!process.env.NO_COLOR);
// Started ahead of the synchronous reads below, which it does not depend on, so its child runs while they do
const regularChecksPromise = getRegularOutdatedDependencies(REPOSITORY_ROOT);

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
const overrideEntries = getOverrideEntries(
  parseWorkspaceEntries(DependencyGroup.Overrides, getSection(DependencyGroup.Overrides, workspaceYaml)),
  catalogEntries,
);
const nodeVersionEntry = {
  group: DependencyGroup.NodeVersion,
  packageName: "node",
  specifier: readFileSync(resolve(REPOSITORY_ROOT, NODE_VERSION_FILENAME), "utf8").trim(),
};
// One listing for every file the report reads by path, since each `git ls-files` walks the whole tree
const filePaths = readSweepFilePaths(
  `*${NPM_LOCKFILE}`,
  `*${DOCKERFILE}`,
  `${GITHUB_DIRECTORY}*.yaml`,
  `${GITHUB_DIRECTORY}*.yml`,
);
const referenceScan = readReferenceScan(filePaths);
const manifests = readManifestFiles(REPOSITORY_ROOT);
const npmProjects = readNpmProjects(
  REPOSITORY_ROOT,
  filePaths.filter((path) => path.endsWith(NPM_LOCKFILE)),
);
const npmManifestPaths = new Set(npmProjects.map(({ manifestPath }) => manifestPath));
const npmManifestNames = new Set(npmProjects.map(({ manifestName }) => manifestName));
const engineEntries = getEngineEntries(manifests);
const packageManagerEntries = getPackageManagerEntries(manifests);
const manifestDependencies = getManifestDependencies(manifests);
const uncatalogedManifestDependencies = getUncatalogedManifestDependencies(manifestDependencies, npmManifestPaths);
const lockCatalogVersions = getLockCatalogVersions(lockYaml);
const lockConfigDependencyVersions = getLockConfigDependencyVersions(lockYaml);
const mismatches = [
  ...getMismatches(catalogEntries, lockCatalogVersions),
  ...getMismatches(configDependencyEntries, lockConfigDependencyVersions),
  ...npmProjects.flatMap(({ entries, resolvedVersions }) => getMismatches(entries, resolvedVersions)),
];

const renovateRules = getRenovateRules(renovateJson);
// A reference `renovate.json` switches off is one the bot never pins either — the collector's own workflow at a branch
const unpinnedReferences = referenceScan.unpinned.filter(
  ({ packageName }) => !getDisablingRule(packageName, renovateRules),
);

printUncatalogedManifestDependencies(uncatalogedManifestDependencies, color);
printMismatches(mismatches, color);
printUnpinnedReferences(unpinnedReferences, color);

// `pnpm outdated` compares against `latest`, which is neither what Renovate proposes for a package a rule follows
// A dist-tag for nor what a specifier naming a dist-tag installs — a nightly line's `5x` is ahead of the stable
// `latest` and would never be reported — so those catalog entries are asked of the registry under their tag
// Instead, each once. pnpm reports an alias under its target's name, so that is the name skipped.
const distTagCatalogEntries = applyDistTags(catalogEntries, lockCatalogVersions);
const followedTagEntries = getFollowedTagEntries(distTagCatalogEntries, renovateRules);
const followedPackages = new Set(followedTagEntries.map((entry) => getRegistryPackageName(entry)));
const [regularChecks, registryChecks, referenceChecks] = await Promise.all([
  regularChecksPromise,
  readRegistryOutdatedDependencies([
    ...applyDistTags(configDependencyEntries, lockConfigDependencyVersions),
    ...engineEntries,
    nodeVersionEntry,
    ...overrideEntries,
    ...packageManagerEntries,
    ...followedTagEntries,
    ...npmProjects.flatMap(({ entries, resolvedVersions }) => applyDistTags(entries, resolvedVersions)),
  ]),
  // Each is a different repository or image, and each costs a whole handshake (`git ls-remote`, a registry token),
  // So all of them run at once rather than queueing behind the npm registry's bound
  readRegistryOutdatedDependencies(referenceScan.entries, referenceScan.entries.length),
]);
// A version Renovate would not propose is not a bump to take by hand either: the two readers share one policy.
const { held, outdated } = partitionHeldDependencies(
  [
    ...omitDependents(
      regularChecks.outdatedDependencies.filter(({ packageName }) => !followedPackages.has(packageName)),
      npmManifestNames,
    ),
    ...registryChecks.outdatedDependencies,
    ...referenceChecks.outdatedDependencies,
  ],
  renovateRules,
);
const errors = [...regularChecks.errors, ...registryChecks.errors, ...referenceChecks.errors];
const hasBlockingIssues =
  uncatalogedManifestDependencies.length > 0 || unpinnedReferences.length > 0 || errors.length > 0;
printOutdatedDependencies(outdated, color);
printHeldDependencies(held, color);
printRegistryErrors(errors, color);
printExecutionTime(startedAt);
if (hasBlockingIssues) process.exitCode = 1;
