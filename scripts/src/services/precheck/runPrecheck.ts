import type { PrecheckReport } from "#src/models/precheck/PrecheckReport";

import { readChangedFiles } from "#src/services/queue/readChangedFiles";
import { readMainCheckoutRoot } from "#src/services/queue/readMainCheckoutRoot";
import { CONFIGURATION_DISTRIBUTION_PATH } from "#src/services/precheck/constants";
import { checkBarrel } from "#src/services/precheck/checkBarrel";
import { readBarrelPackages } from "#src/services/precheck/readBarrelPackages";
import { readUnformattedPaths } from "#src/services/precheck/readUnformattedPaths";
import { existsSync } from "node:fs";
import { join } from "node:path";

// The two cheap checks CI would otherwise be the first to run on a push: the formatter over each changed file, and each
// Changed package's barrel against what its generator writes. Typecheck, lint and the tests stay CI's
export const runPrecheck = (fix: boolean): PrecheckReport => {
  const mainCheckoutRoot = readMainCheckoutRoot();
  const changedFiles = readChangedFiles();
  const unformattedPaths = readUnformattedPaths(changedFiles, mainCheckoutRoot);
  const barrelPackages = readBarrelPackages(changedFiles);
  if (barrelPackages.length > 0 && !existsSync(join(mainCheckoutRoot, CONFIGURATION_DISTRIBUTION_PATH)))
    return { distributionMissing: true, findings: [], regenerated: [] };
  const barrelChecks = barrelPackages.map((packageDirectory) => checkBarrel(packageDirectory, mainCheckoutRoot, fix));
  return {
    distributionMissing: false,
    findings: [
      ...unformattedPaths.map((path) => `unformatted ${path}`),
      ...(unformattedPaths.length === 0 ? [] : [`fix: pnpm ai:format ${unformattedPaths.join(" ")}`]),
      ...barrelChecks.flatMap(({ findings }) => findings),
    ],
    regenerated: barrelChecks.flatMap(({ regenerated }) => regenerated),
  };
};
