import type { MergeMainInput } from "#src/models/coderabbit/collect/MergeMainInput";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { MergeMainOutcome } from "#src/models/coderabbit/collect/MergeMainOutcome";
import { checkIsAncestor } from "#src/services/coderabbit/collect/checkIsAncestor";
import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import { checkIsSequencing } from "#src/services/coderabbit/collect/checkIsSequencing";
import { DRAIN_ATTEMPT_CAP, FOLD_FAILED_MARKER, MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getFoldPrompt } from "#src/services/coderabbit/collect/getFoldPrompt";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { readDirtyPaths } from "#src/services/coderabbit/collect/readDirtyPaths";
import { readUnmergedPaths } from "#src/services/coderabbit/collect/readUnmergedPaths";
import { runDrain } from "#src/services/coderabbit/collect/runDrain";
import { spawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { LOCKFILE } from "#src/services/shared/constants";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { rmSync } from "node:fs";
import { join } from "node:path";

// What landed on `main` unread — an express cut, a dependency bump — rides the window about to be pushed rather
// Than waiting for the release to bring the two together. The lockfile conflict that merge always brings is
// Rebuilt from the installed tree (`git` skill); any other conflict is the resolver's, counted on `main`'s head,
// And past its attempts the fold is abandoned — the release merge is then where a person meets it.
export const mergeMain = async ({ cwd, viewerLogin }: MergeMainInput): Promise<MergeMainOutcome> => {
  const main = `origin/${MAIN_BRANCH}`;
  if (checkIsAncestor(main, "HEAD", cwd)) return MergeMainOutcome.AlreadyMerged;

  const isMerged = getResult(() => runGit(["merge", "--no-edit", main], cwd)).match(
    () => true,
    () => false,
  );
  if (isMerged) return MergeMainOutcome.Merged;

  const conflictedPaths = readUnmergedPaths(cwd);
  if (conflictedPaths.length === 1 && conflictedPaths[0] === LOCKFILE) {
    rmSync(join(cwd, LOCKFILE));
    if (spawnPnpm(["i"], { cwd, stdio: "inherit" }).status !== 0)
      throw new InvalidOperationError(Operation.Update, "coderabbit", "the lockfile could not be rebuilt");
    runGit(["add", LOCKFILE], cwd);
    runGit(["commit", "--no-edit"], cwd);
    return MergeMainOutcome.Merged;
  }

  const mainSha = runGit(["rev-parse", main], cwd).trim();
  const abort = (reason: string): MergeMainOutcome => {
    runGit(["merge", "--abort"], cwd);
    console.info(`main not folded — ${reason}: ${conflictedPaths.join(", ")}`);
    return MergeMainOutcome.Conflicted;
  };
  const marker = getMarker(FOLD_FAILED_MARKER, mainSha);
  const attempts = readEntries<GitHubEntry>(`commits/${mainSha}/comments`).filter((comment) =>
    checkIsMarked(comment, viewerLogin, marker),
  ).length;
  if (attempts >= DRAIN_ATTEMPT_CAP) return abort(`its conflicts failed the resolver ${attempts} times`);

  const { isDrained, limitResetAtMs } = await runDrain(getFoldPrompt({ conflictedPaths, mainSha }), cwd);
  if (limitResetAtMs !== undefined) return abort("the resolver could not start, and no attempt is counted");
  // What proves the fold is the merge committed over a clean tree with `main` now an ancestor; the session's
  // Word proves nothing. Anything else counts the attempt on `main`'s head and fails the run.
  if (!isDrained || checkIsSequencing(cwd) || readDirtyPaths(cwd).length > 0 || !checkIsAncestor(main, "HEAD", cwd)) {
    postCommitComment(
      mainSha,
      `${marker}\nFold attempt ${attempts + 1} of this main head into the window failed — see the collector run.`,
    );
    throw new InvalidOperationError(
      Operation.Update,
      "coderabbit",
      `the resolver left the fold of ${mainSha} unresolved (attempt ${attempts + 1} of ${DRAIN_ATTEMPT_CAP})`,
    );
  }
  return MergeMainOutcome.Merged;
};
