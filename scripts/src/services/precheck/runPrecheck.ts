import type { PrecheckReport } from "#src/models/precheck/PrecheckReport";

import { checkBarrel } from "#src/services/precheck/checkBarrel";
import { checkGraph } from "#src/services/precheck/checkGraph";
import { checkHasGraphInput } from "#src/services/precheck/checkHasGraphInput";
import { checkLedgerTrailers } from "#src/services/precheck/checkLedgerTrailers";
import { checkLedgerUnits } from "#src/services/precheck/checkLedgerUnits";
import { readBarrelPackages } from "#src/services/precheck/readBarrelPackages";
import { readUnformattedPaths } from "#src/services/precheck/readUnformattedPaths";
import { readChangedFiles } from "#src/services/queue/readChangedFiles";
import { readMainCheckoutRoot } from "#src/services/queue/readMainCheckoutRoot";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";

// The cheap checks CI would otherwise be the first to run on a push: the formatter over each changed file, each changed
// Package's barrel against what its generator writes, after a manifest change the dependency graph against what its
// Generator draws, each derived ledger's rows against the tree they are derived from, and each ledger trailer of the
// Commits being landed against the rows it names. With `fix`, each stale generated file and each row naming a reworded
// Unit is rewritten. Typecheck, lint and the tests stay CI's
export const runPrecheck = async (fix: boolean): Promise<PrecheckReport> => {
  const mainCheckoutRoot = readMainCheckoutRoot();
  const changedFiles = readChangedFiles();
  const unformattedPaths = readUnformattedPaths(changedFiles, REPOSITORY_ROOT, mainCheckoutRoot);
  const barrelPackages = readBarrelPackages(changedFiles);
  const barrelChecks = barrelPackages.map((packageDirectory) => checkBarrel(packageDirectory, fix));
  // The graph's edges come from the committed lockfile, which every checkout holds the same way, so a manifest change
  // In a linked worktree is checked like one in the main checkout
  const graphChecks = checkHasGraphInput(changedFiles) ? [await checkGraph(fix)] : [];
  const checks = [...barrelChecks, ...graphChecks, checkLedgerUnits(fix)];
  return {
    findings: [
      ...unformattedPaths.map((path) => `unformatted ${path}`),
      ...(unformattedPaths.length === 0 ? [] : [`fix: pnpm ai:format ${unformattedPaths.join(" ")}`]),
      ...checks.flatMap(({ findings }) => findings),
      ...checkLedgerTrailers(),
    ],
    regenerated: checks.flatMap(({ regenerated }) => regenerated),
  };
};
