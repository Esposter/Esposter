import type { OutdatedDependency } from "#src/models/outdatedDependencies/OutdatedDependency";
import type { OutdatedDependencyCheck } from "#src/models/outdatedDependencies/OutdatedDependencyCheck";

import { getDependencyType } from "#src/services/outdatedDependencies/getDependencyType";
import { checkIsPnpmOutdatedDependency } from "#src/services/outdatedDependencies/pnpm/checkIsPnpmOutdatedDependency";
import { getOutdatedDependents } from "#src/services/outdatedDependencies/pnpm/getOutdatedDependents";
import { getPnpmOutdatedFailure } from "#src/services/outdatedDependencies/pnpm/getPnpmOutdatedFailure";
import { runPnpmOutdated } from "#src/services/outdatedDependencies/pnpm/runPnpmOutdated";
import { getResult, jsonDateParse } from "@esposter/shared";

const UNEXPECTED_JSON_OUTPUT = "unexpected JSON output";

export const getRegularOutdatedDependencies = async (root: string): Promise<OutdatedDependencyCheck> => {
  const result = await runPnpmOutdated(root);

  if (result.error) return getPnpmOutdatedFailure(result.error);
  // Warning notices are interleaved into pnpm's stdout, so isolate the JSON object printed at column 0.
  const jsonStart = result.stdout.search(/^\{/mu);
  if (jsonStart === -1) {
    if (result.status !== 0)
      return getPnpmOutdatedFailure(
        result.stderr.trim() ||
          (result.status === null ? "terminated before completion" : `exit code ${result.status}`),
      );

    return { errors: [], outdatedDependencies: [] };
  }

  return getResult(() => jsonDateParse<unknown>(result.stdout.slice(jsonStart))).match(
    (parsed) => {
      if (!parsed || typeof parsed !== "object") return getPnpmOutdatedFailure(UNEXPECTED_JSON_OUTPUT);

      const outdatedDependencies: OutdatedDependency[] = [];
      for (const [pkg, dependency] of Object.entries(parsed)) {
        if (!checkIsPnpmOutdatedDependency(dependency))
          return getPnpmOutdatedFailure(`unexpected JSON entry for ${pkg}`);

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
    () => getPnpmOutdatedFailure(UNEXPECTED_JSON_OUTPUT),
  );
};
