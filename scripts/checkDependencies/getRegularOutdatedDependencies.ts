import type { OutdatedDependency } from "@/checkDependencies/models/OutdatedDependency";
import type { RegistryCheckError } from "@/checkDependencies/models/RegistryCheckError";

import { getDependencyType } from "@/checkDependencies/getDependencyType";
import { getOutdatedDependents } from "@/checkDependencies/getOutdatedDependents";
import { isPnpmOutdatedDependency } from "@/checkDependencies/isPnpmOutdatedDependency";
import { runPnpmOutdated } from "@/checkDependencies/runPnpmOutdated";

export const getRegularOutdatedDependencies = async (
  root: string,
): Promise<{ errors: RegistryCheckError[]; outdatedDependencies: OutdatedDependency[] }> => {
  const result = await runPnpmOutdated(root);

  if (result.error) return { errors: [{ error: result.error, pkg: "pnpm outdated -r" }], outdatedDependencies: [] };

  // Pnpm interleaves "[WARN] ..." retry notices into stdout, so isolate the JSON object (printed at column 0).
  const jsonStart = result.stdout.search(/^\{/mu);
  if (jsonStart === -1) {
    if (result.status && result.status !== 0)
      return {
        errors: [{ error: result.stderr.trim() || `exit code ${result.status}`, pkg: "pnpm outdated -r" }],
        outdatedDependencies: [],
      };

    return { errors: [], outdatedDependencies: [] };
  }

  const parsed: unknown = JSON.parse(result.stdout.slice(jsonStart));
  if (!parsed || typeof parsed !== "object")
    return { errors: [{ error: "unexpected JSON output", pkg: "pnpm outdated -r" }], outdatedDependencies: [] };

  const outdatedDependencies: OutdatedDependency[] = [];
  for (const [pkg, dependency] of Object.entries(parsed)) {
    if (!isPnpmOutdatedDependency(dependency))
      return {
        errors: [{ error: `unexpected JSON entry for ${pkg}`, pkg: "pnpm outdated -r" }],
        outdatedDependencies: [],
      };

    outdatedDependencies.push({
      current: dependency.current ?? "",
      dependencyType: getDependencyType(dependency.dependencyType ?? ""),
      dependents: getOutdatedDependents(dependency.dependentPackages),
      latest: dependency.latest,
      pkg,
      specifier: "",
    });
  }

  return { errors: [], outdatedDependencies };
};
