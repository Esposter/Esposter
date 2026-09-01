import { createColor } from "#scripts/checkDependencies/createColor";
import { getEngineEntries } from "#scripts/checkDependencies/getEngineEntries";
import { getLockCatalogVersions } from "#scripts/checkDependencies/getLockCatalogVersions";
import { getLockConfigDependencyVersions } from "#scripts/checkDependencies/getLockConfigDependencyVersions";
import { getManifestDependencies } from "#scripts/checkDependencies/getManifestDependencies";
import { getManifests } from "#scripts/checkDependencies/getManifests";
import { getMismatches } from "#scripts/checkDependencies/getMismatches";
import { getRegistryOutdatedDependencies } from "#scripts/checkDependencies/getRegistryOutdatedDependencies";
import { getRegularOutdatedDependencies } from "#scripts/checkDependencies/getRegularOutdatedDependencies";
import { getSection } from "#scripts/checkDependencies/getSection";
import { getUncatalogedManifestDependencies } from "#scripts/checkDependencies/getUncatalogedManifestDependencies";
import { parseWorkspaceEntries } from "#scripts/checkDependencies/parseWorkspaceEntries";
import { printExecutionTime } from "#scripts/checkDependencies/printExecutionTime";
import { printMismatches } from "#scripts/checkDependencies/printMismatches";
import { printOutdatedDependencies } from "#scripts/checkDependencies/printOutdatedDependencies";
import { printRegistryErrors } from "#scripts/checkDependencies/printRegistryErrors";
import { printUncatalogedManifestDependencies } from "#scripts/checkDependencies/printUncatalogedManifestDependencies";
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
const manifests = getManifests(root);
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
