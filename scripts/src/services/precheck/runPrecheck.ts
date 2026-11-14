import type { PrecheckReport } from "#src/models/precheck/PrecheckReport";

import { checkBarrel } from "#src/services/precheck/checkBarrel";
import { checkGraph } from "#src/services/precheck/checkGraph";
import { checkHasGraphInput } from "#src/services/precheck/checkHasGraphInput";
import { CONFIGURATION_DISTRIBUTION_PATH } from "#src/services/precheck/constants";
import { readBarrelPackages } from "#src/services/precheck/readBarrelPackages";
import { readUnformattedPaths } from "#src/services/precheck/readUnformattedPaths";
import { checkIsLinkedWorktree } from "#src/services/queue/checkIsLinkedWorktree";
import { readChangedFiles } from "#src/services/queue/readChangedFiles";
import { readMainCheckoutRoot } from "#src/services/queue/readMainCheckoutRoot";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { existsSync } from "node:fs";
import { join } from "node:path";

// The cheap checks CI would otherwise be the first to run on a push: the formatter over each changed file, each changed
// Package's barrel against what its generator writes, and, after a manifest change, the dependency graph against what its
// Generator draws. Typecheck, lint and the tests stay CI's
export const runPrecheck = async (fix: boolean): Promise<PrecheckReport> => {
  const mainCheckoutRoot = readMainCheckoutRoot();
  const changedFiles = readChangedFiles();
  const unformattedPaths = readUnformattedPaths(changedFiles, REPOSITORY_ROOT, mainCheckoutRoot);
  const barrelPackages = readBarrelPackages(changedFiles);
  if (barrelPackages.length > 0 && !existsSync(join(mainCheckoutRoot, CONFIGURATION_DISTRIBUTION_PATH)))
    return { distributionMissing: true, findings: [], regenerated: [] };
  const barrelChecks = barrelPackages.map((packageDirectory) => checkBarrel(packageDirectory, mainCheckoutRoot, fix));
  // The graph's edges are the links pnpm's installed state holds, and a linked worktree's narrowed install has none to its
  // Siblings, so it would draw a graph with no edges and call the committed one stale. Only the main checkout can tell
  const graphChecks = checkHasGraphInput(changedFiles) && !checkIsLinkedWorktree() ? [await checkGraph(fix)] : [];
  const checks = [...barrelChecks, ...graphChecks];
  return {
    distributionMissing: false,
    findings: [
      ...unformattedPaths.map((path) => `unformatted ${path}`),
      ...(unformattedPaths.length === 0 ? [] : [`fix: pnpm ai:format ${unformattedPaths.join(" ")}`]),
      ...checks.flatMap(({ findings }) => findings),
    ],
    regenerated: checks.flatMap(({ regenerated }) => regenerated),
  };
};
