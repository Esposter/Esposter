import { DependencyGroup } from "#src/models/outdatedDependencies/DependencyGroup";
import { REPOSITORY_ROOT } from "#src/services/constants";
import { getMismatches } from "#src/services/outdatedDependencies/getMismatches";
import { getLockCatalogVersions } from "#src/services/outdatedDependencies/lock/getLockCatalogVersions";
import { getLockConfigDependencyVersions } from "#src/services/outdatedDependencies/lock/getLockConfigDependencyVersions";
import { getEngineEntries } from "#src/services/outdatedDependencies/manifest/getEngineEntries";
import { getManifestDependencies } from "#src/services/outdatedDependencies/manifest/getManifestDependencies";
import { getManifestFiles } from "#src/services/outdatedDependencies/manifest/getManifestFiles";
import { getUncatalogedManifestDependencies } from "#src/services/outdatedDependencies/manifest/getUncatalogedManifestDependencies";
import { getRegularOutdatedDependencies } from "#src/services/outdatedDependencies/pnpm/getRegularOutdatedDependencies";
import { createColor } from "#src/services/outdatedDependencies/print/createColor";
import { printExecutionTime } from "#src/services/outdatedDependencies/print/printExecutionTime";
import { printMismatches } from "#src/services/outdatedDependencies/print/printMismatches";
import { printOutdatedDependencies } from "#src/services/outdatedDependencies/print/printOutdatedDependencies";
import { printRegistryErrors } from "#src/services/outdatedDependencies/print/printRegistryErrors";
import { printUncatalogedManifestDependencies } from "#src/services/outdatedDependencies/print/printUncatalogedManifestDependencies";
import { getRegistryOutdatedDependencies } from "#src/services/outdatedDependencies/registry/getRegistryOutdatedDependencies";
import { getSection } from "#src/services/outdatedDependencies/workspace/getSection";
import { parseWorkspaceEntries } from "#src/services/outdatedDependencies/workspace/parseWorkspaceEntries";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const startedAt = performance.now();
const color = createColor(!process.env.NO_COLOR);

const workspaceYaml = readFileSync(resolve(REPOSITORY_ROOT, "pnpm-workspace.yaml"), "utf8");
const lockYaml = readFileSync(resolve(REPOSITORY_ROOT, "pnpm-lock.yaml"), "utf8");

const catalogEntries = parseWorkspaceEntries(
  DependencyGroup.Catalog,
  getSection(DependencyGroup.Catalog, workspaceYaml),
);
const configDependencyEntries = parseWorkspaceEntries(
  DependencyGroup.ConfigDependencies,
  getSection(DependencyGroup.ConfigDependencies, workspaceYaml),
);
const manifests = getManifestFiles(REPOSITORY_ROOT);
const engineEntries = getEngineEntries(manifests);
const manifestDependencies = getManifestDependencies(manifests);
const uncatalogedManifestDependencies = getUncatalogedManifestDependencies(manifestDependencies);
const mismatches = [
  ...getMismatches(catalogEntries, getLockCatalogVersions(lockYaml)),
  ...getMismatches(configDependencyEntries, getLockConfigDependencyVersions(lockYaml)),
];

printUncatalogedManifestDependencies(uncatalogedManifestDependencies, color);
printMismatches(mismatches, color);

const [regularChecks, registryChecks] = await Promise.all([
  getRegularOutdatedDependencies(REPOSITORY_ROOT),
  getRegistryOutdatedDependencies([...configDependencyEntries, ...engineEntries]),
]);
const outdatedDependencies = [...regularChecks.outdatedDependencies, ...registryChecks.outdatedDependencies];
const errors = [...regularChecks.errors, ...registryChecks.errors];
const hasBlockingIssues = uncatalogedManifestDependencies.length > 0 || errors.length > 0;
printOutdatedDependencies(outdatedDependencies, color);
printRegistryErrors(errors, color);
printExecutionTime(startedAt);
if (hasBlockingIssues) process.exitCode = 1;
