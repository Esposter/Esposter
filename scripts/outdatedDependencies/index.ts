import { createColor } from "#scripts/outdatedDependencies/createColor";
import { getEngineEntries } from "#scripts/outdatedDependencies/getEngineEntries";
import { getLockCatalogVersions } from "#scripts/outdatedDependencies/getLockCatalogVersions";
import { getLockConfigDependencyVersions } from "#scripts/outdatedDependencies/getLockConfigDependencyVersions";
import { getManifestDependencies } from "#scripts/outdatedDependencies/getManifestDependencies";
import { getManifestFiles } from "#scripts/outdatedDependencies/getManifestFiles";
import { getMismatches } from "#scripts/outdatedDependencies/getMismatches";
import { getRegistryOutdatedDependencies } from "#scripts/outdatedDependencies/getRegistryOutdatedDependencies";
import { getRegularOutdatedDependencies } from "#scripts/outdatedDependencies/getRegularOutdatedDependencies";
import { getSection } from "#scripts/outdatedDependencies/getSection";
import { getUncatalogedManifestDependencies } from "#scripts/outdatedDependencies/getUncatalogedManifestDependencies";
import { parseWorkspaceEntries } from "#scripts/outdatedDependencies/parseWorkspaceEntries";
import { printExecutionTime } from "#scripts/outdatedDependencies/printExecutionTime";
import { printMismatches } from "#scripts/outdatedDependencies/printMismatches";
import { printOutdatedDependencies } from "#scripts/outdatedDependencies/printOutdatedDependencies";
import { printRegistryErrors } from "#scripts/outdatedDependencies/printRegistryErrors";
import { printUncatalogedManifestDependencies } from "#scripts/outdatedDependencies/printUncatalogedManifestDependencies";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..");
const startedAt = performance.now();
const color = createColor(!process.env.NO_COLOR);

const workspaceYaml = readFileSync(resolve(root, "pnpm-workspace.yaml"), "utf8");
const lockYaml = readFileSync(resolve(root, "pnpm-lock.yaml"), "utf8");

const catalogEntries = parseWorkspaceEntries("catalog", getSection("catalog", workspaceYaml));
const configDependencyEntries = parseWorkspaceEntries(
  "configDependencies",
  getSection("configDependencies", workspaceYaml),
);
const manifests = getManifestFiles(root);
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
  getRegularOutdatedDependencies(root),
  getRegistryOutdatedDependencies([...configDependencyEntries, ...engineEntries]),
]);
const outdatedDependencies = [...regularChecks.outdatedDependencies, ...registryChecks.outdatedDependencies];
const errors = [...regularChecks.errors, ...registryChecks.errors];
const hasBlockingIssues = uncatalogedManifestDependencies.length > 0 || errors.length > 0;
printOutdatedDependencies(outdatedDependencies, color);
printRegistryErrors(errors, color);
printExecutionTime(startedAt);
if (hasBlockingIssues) process.exitCode = 1;
