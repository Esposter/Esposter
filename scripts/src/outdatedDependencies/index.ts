import { createColor } from "#src/outdatedDependencies/createColor";
import { getEngineEntries } from "#src/outdatedDependencies/getEngineEntries";
import { getLockCatalogVersions } from "#src/outdatedDependencies/getLockCatalogVersions";
import { getLockConfigDependencyVersions } from "#src/outdatedDependencies/getLockConfigDependencyVersions";
import { getManifestDependencies } from "#src/outdatedDependencies/getManifestDependencies";
import { getManifestFiles } from "#src/outdatedDependencies/getManifestFiles";
import { getMismatches } from "#src/outdatedDependencies/getMismatches";
import { getRegistryOutdatedDependencies } from "#src/outdatedDependencies/getRegistryOutdatedDependencies";
import { getRegularOutdatedDependencies } from "#src/outdatedDependencies/getRegularOutdatedDependencies";
import { getSection } from "#src/outdatedDependencies/getSection";
import { getUncatalogedManifestDependencies } from "#src/outdatedDependencies/getUncatalogedManifestDependencies";
import { parseWorkspaceEntries } from "#src/outdatedDependencies/parseWorkspaceEntries";
import { printExecutionTime } from "#src/outdatedDependencies/printExecutionTime";
import { printMismatches } from "#src/outdatedDependencies/printMismatches";
import { printOutdatedDependencies } from "#src/outdatedDependencies/printOutdatedDependencies";
import { printRegistryErrors } from "#src/outdatedDependencies/printRegistryErrors";
import { printUncatalogedManifestDependencies } from "#src/outdatedDependencies/printUncatalogedManifestDependencies";
import { REPOSITORY_ROOT } from "#src/services/constants";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const startedAt = performance.now();
const color = createColor(!process.env.NO_COLOR);

const workspaceYaml = readFileSync(resolve(REPOSITORY_ROOT, "pnpm-workspace.yaml"), "utf8");
const lockYaml = readFileSync(resolve(REPOSITORY_ROOT, "pnpm-lock.yaml"), "utf8");

const catalogEntries = parseWorkspaceEntries("catalog", getSection("catalog", workspaceYaml));
const configDependencyEntries = parseWorkspaceEntries(
  "configDependencies",
  getSection("configDependencies", workspaceYaml),
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
