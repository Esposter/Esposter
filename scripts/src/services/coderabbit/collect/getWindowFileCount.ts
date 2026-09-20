import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// The files the next review reads: changed since the frontier, and on the pull request's own side of `main`. A
// Fold of `main` puts `main`'s files into the range from the frontier, but the bot's file cap is the pull
// Request's diff against its base, which a merged-in base never enters — so the fold is never what overflows a
// Window (docs: infra/review-collector/collection-cycle, "Port")
export const getWindowFileCount = (frontierSha: string, cwd?: string): number => {
  const sideFiles = new Set(getNonEmptyLines(runGit(["diff", "--name-only", `origin/${MAIN_BRANCH}...HEAD`], cwd)));
  return getNonEmptyLines(runGit(["diff", "--name-only", `${frontierSha}..HEAD`], cwd)).filter((path) =>
    sideFiles.has(path),
  ).length;
};
