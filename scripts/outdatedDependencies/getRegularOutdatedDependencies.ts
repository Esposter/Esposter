import type { OutdatedDependency } from "#scripts/outdatedDependencies/models/OutdatedDependency";
import type { RegistryCheckError } from "#scripts/outdatedDependencies/models/RegistryCheckError";

import { getDependencyType } from "#scripts/outdatedDependencies/getDependencyType";
import { getOutdatedDependents } from "#scripts/outdatedDependencies/getOutdatedDependents";
import { isPnpmOutdatedDependency } from "#scripts/outdatedDependencies/isPnpmOutdatedDependency";
import { runPnpmOutdated } from "#scripts/outdatedDependencies/runPnpmOutdated";
import { getResult, jsonDateParse } from "@esposter/shared";

export const getRegularOutdatedDependencies = async (
  root: string,
): Promise<{ errors: RegistryCheckError[]; outdatedDependencies: OutdatedDependency[] }> => {
  const result = await runPnpmOutdated(root);

  if (result.error) return { errors: [{ error: result.error, pkg: "pnpm outdated -r" }], outdatedDependencies: [] };
  // Warning notices are interleaved into pnpm's stdout, so isolate the JSON object printed at column 0.
  const jsonStart = result.stdout.search(/^\{/mu);
  if (jsonStart === -1) {
    if (result.status !== 0)
      return {
        errors: [
          {
            error:
              result.stderr.trim() ||
              (result.status === null ? "terminated before completion" : `exit code ${result.status}`),
            pkg: "pnpm outdated -r",
          },
        ],
        outdatedDependencies: [],
      };

    return { errors: [], outdatedDependencies: [] };
  }

  return getResult(() => jsonDateParse<unknown>(result.stdout.slice(jsonStart))).match(
    (parsed) => {
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
    },
    () => ({ errors: [{ error: "unexpected JSON output", pkg: "pnpm outdated -r" }], outdatedDependencies: [] }),
  );
};
