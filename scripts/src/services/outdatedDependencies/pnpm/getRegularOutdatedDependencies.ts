import type { OutdatedDependency } from "#src/models/outdatedDependencies/shared/OutdatedDependency";
import type { OutdatedDependencyCheck } from "#src/models/outdatedDependencies/shared/OutdatedDependencyCheck";

import { getDependencyType } from "#src/services/outdatedDependencies/getDependencyType";
import { checkIsPnpmOutdatedDependency } from "#src/services/outdatedDependencies/pnpm/checkIsPnpmOutdatedDependency";
import { getOutdatedDependents } from "#src/services/outdatedDependencies/pnpm/getOutdatedDependents";
import { getPnpmOutdatedFailure } from "#src/services/outdatedDependencies/pnpm/getPnpmOutdatedFailure";
import { runPnpmOutdated } from "#src/services/outdatedDependencies/pnpm/runPnpmOutdated";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResult } from "@esposter/shared";

const UNEXPECTED_JSON_OUTPUT = "unexpected JSON output";

export const getRegularOutdatedDependencies = async (root: string): Promise<OutdatedDependencyCheck> => {
  const pnpmOutdatedResult = await runPnpmOutdated(root);

  if (pnpmOutdatedResult.error) return getPnpmOutdatedFailure(pnpmOutdatedResult.error);
  // Warning notices are interleaved into pnpm's stdout, so isolate the JSON object printed at column 0.
  const jsonStart = pnpmOutdatedResult.stdout.search(/^\{/mu);
  if (jsonStart === -1) {
    if (pnpmOutdatedResult.status !== 0)
      return getPnpmOutdatedFailure(
        pnpmOutdatedResult.stderr.trim() ||
          (pnpmOutdatedResult.status === undefined
            ? "terminated before completion"
            : `exit code ${pnpmOutdatedResult.status}`),
      );

    return { errors: [], outdatedDependencies: [] };
  }

  return getResult(() => parseMachineJson(pnpmOutdatedResult.stdout.slice(jsonStart))).match(
    (outdatedJson) => {
      if (!outdatedJson || typeof outdatedJson !== "object") return getPnpmOutdatedFailure(UNEXPECTED_JSON_OUTPUT);

      const outdatedDependencies: OutdatedDependency[] = [];
      for (const [packageName, dependency] of Object.entries(outdatedJson)) {
        if (!checkIsPnpmOutdatedDependency(dependency))
          return getPnpmOutdatedFailure(`unexpected JSON entry for ${packageName}`);

        outdatedDependencies.push({
          current: dependency.current ?? "",
          dependencyType: getDependencyType(dependency.dependencyType ?? ""),
          dependents: getOutdatedDependents(dependency.dependentPackages),
          latest: dependency.latest,
          packageName,
          specifier: "",
        });
      }

      return { errors: [], outdatedDependencies };
    },
    () => getPnpmOutdatedFailure(UNEXPECTED_JSON_OUTPUT),
  );
};
