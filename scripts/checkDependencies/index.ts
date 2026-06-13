import { createColor } from "@/checkDependencies/createColor";
import { getConfigDependencyRegistryChecks } from "@/checkDependencies/getConfigDependencyRegistryChecks";
import { getLockCatalogVersions } from "@/checkDependencies/getLockCatalogVersions";
import { getLockConfigDependencyVersions } from "@/checkDependencies/getLockConfigDependencyVersions";
import { getManifestDependencies } from "@/checkDependencies/getManifestDependencies";
import { getMismatches } from "@/checkDependencies/getMismatches";
import { getRegularOutdatedDependencies } from "@/checkDependencies/getRegularOutdatedDependencies";
import { getSection } from "@/checkDependencies/getSection";
import { getUncatalogedManifestDependencies } from "@/checkDependencies/getUncatalogedManifestDependencies";
import { parseWorkspaceEntries } from "@/checkDependencies/parseWorkspaceEntries";
import { printExecutionTime } from "@/checkDependencies/printExecutionTime";
import { printMismatches } from "@/checkDependencies/printMismatches";
import { printOutdatedDependencies } from "@/checkDependencies/printOutdatedDependencies";
import { printRegistryErrors } from "@/checkDependencies/printRegistryErrors";
import { printUncatalogedManifestDependencies } from "@/checkDependencies/printUncatalogedManifestDependencies";
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
const manifestDependencies = getManifestDependencies(root);
const uncatalogedManifestDependencies = getUncatalogedManifestDependencies(manifestDependencies);
const mismatches = [
  ...getMismatches(catalogEntries, getLockCatalogVersions(lockYaml)),
  ...getMismatches(configDependencyEntries, getLockConfigDependencyVersions(lockYaml)),
];

printUncatalogedManifestDependencies(uncatalogedManifestDependencies, color);
printMismatches(mismatches, color);

const [regularChecks, configDependencyChecks] = await Promise.all([
  getRegularOutdatedDependencies(root),
  getConfigDependencyRegistryChecks(configDependencyEntries),
]);
const outdatedDependencies = [...regularChecks.outdatedDependencies, ...configDependencyChecks.outdatedDependencies];
const errors = [...regularChecks.errors, ...configDependencyChecks.errors];
const hasBlockingIssues = uncatalogedManifestDependencies.length > 0 || mismatches.length > 0 || errors.length > 0;
printOutdatedDependencies(outdatedDependencies, color);
printRegistryErrors(errors, color);
printExecutionTime(startedAt);
if (hasBlockingIssues) process.exitCode = 1;
