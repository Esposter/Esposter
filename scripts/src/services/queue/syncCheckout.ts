import { QUEUE_BRANCH } from "#src/services/coderabbit/collect/constants";
import { readSha } from "#src/services/coderabbit/collect/readSha";
import { addReplayWorktree } from "#src/services/queue/addReplayWorktree";
import { mergeWorkingCopy } from "#src/services/queue/mergeWorkingCopy";
import { pickCommit } from "#src/services/queue/pickCommit";
import { removeReplayWorktree } from "#src/services/queue/removeReplayWorktree";
import { checkIsAncestor } from "#src/services/shared/checkIsAncestor";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// One file of the checkout's uncommitted edit, held in memory across the reset: `headContent` is what the reset needs the
// File to be, `merged` is the edit carried onto the target, and `original` is what a refused sync puts back
interface DirtyMerge {
  file: string;
  headContent: string;
  merged: string;
  original: string;
}

// `-z` leaves a path unquoted, so a name with a space or a non-ASCII character reads back exactly
const readChangedPaths = (args: string[], cwd: string): string[] =>
  runGit(["diff", "--name-only", "-z", ...args], cwd)
    .split("\0")
    .filter(Boolean);

const readBlob = (revision: string, file: string, cwd: string): string | undefined =>
  getResult(() => runGit(["cat-file", "blob", `${revision}:${file}`], cwd)).unwrapOr(undefined);

// A file missing from either side has no base or no tip to merge onto, and a binary one has no lines to merge and does
// Not survive the text round trip, so both are refused like a conflict
const readDirtyMerge = (file: string, head: string, target: string, cwd: string): DirtyMerge | undefined => {
  const headContent = readBlob(head, file, cwd);
  const targetContent = readBlob(target, file, cwd);
  const original = getResult(() => readFileSync(join(cwd, file), "utf8")).unwrapOr(undefined);
  if (headContent === undefined || targetContent === undefined || original === undefined) return undefined;

  const isBinaryFile = [headContent, targetContent, original].some((content) => content.includes("\0"));
  if (isBinaryFile) return undefined;

  const merged = mergeWorkingCopy(original, headContent, targetContent);
  return merged === undefined ? undefined : { file, headContent, merged, original };
};

// Picks each landed commit onto the worktree's tip in order. A pick that conflicts is aborted, so the worktree is left
// At the commit before it, and the caller reads that as a refusal
const pickLandedCommits = (landed: string[], replayCwd: string): boolean =>
  landed.every((commit) => {
    if (pickCommit(commit, replayCwd)) return true;
    if (readSha("CHERRY_PICK_HEAD", replayCwd) !== undefined) runGit(["cherry-pick", "--abort"], replayCwd);
    return false;
  });

// Builds the tip the checkout's branch moves onto: `pushed` with each landed commit picked on top, in a throwaway
// Worktree that is removed on every path. Undefined when a pick conflicts, so the branch waits for the next push
const buildTarget = (pushed: string, landed: string[], cwd: string): string | undefined => {
  const replayCwd = addReplayWorktree(pushed, cwd);
  const target = getResult(() =>
    pickLandedCommits(landed, replayCwd) ? runGit(["rev-parse", "HEAD"], replayCwd).trim() : undefined,
  );
  removeReplayWorktree(replayCwd, cwd);
  return target.match(
    (sha) => sha,
    (error) => {
      throw error;
    },
  );
};

// Moves the checkout's branch from `head` onto the tip the push carried, `pushed`, with what landed on the branch since
// `base`, the head the replay started from, picked on top of it. That tip is built off to the side first, in a throwaway
// Worktree, so a landed commit that conflicts with the pushed one leaves the branch where it stands, for the next push
// To carry. Only then does the checkout move: `reset --keep` cannot run over another session's uncommitted edit, so an
// Edit to a file the target changes is three-way merged onto the target first, and the reset runs with that file at
// HEAD's content. Where the merge conflicts the sync refuses and changes nothing. The reset also refuses to run unless
// `head` is still HEAD, since a commit that landed while the target was built would otherwise be moved past. `head` is
// The HEAD the caller reads for this sync, so a commit the caller has not yet seen is one the sync leaves in place
export const syncCheckout = (pushed: string, base: string, head: string, cwd: string): void => {
  const synced = `synced ${QUEUE_BRANCH} onto ${pushed}`;
  if (checkIsAncestor(pushed, head, cwd)) {
    console.info(synced);
    return;
  }

  const landed = getNonEmptyLines(runGit(["rev-list", "--reverse", `${base}..${head}`], cwd));
  const target = landed.length > 0 ? buildTarget(pushed, landed, cwd) : pushed;
  if (target === undefined) {
    console.info(
      `the checkout's branch waits: a commit that landed during the push conflicts with ${pushed}, nothing changed`,
    );
    return;
  }

  const targetFiles = new Set(readChangedPaths([head, target], cwd));
  const editedFiles = readChangedPaths([head], cwd);
  const overlappingFiles = editedFiles.filter((editedFile) => targetFiles.has(editedFile));
  const merges: DirtyMerge[] = [];
  for (const file of overlappingFiles) {
    const merge = readDirtyMerge(file, head, target, cwd);
    if (merge === undefined) {
      console.info(
        `the checkout's branch waits: ${file} has an uncommitted edit that cannot be synced over the push, nothing changed`,
      );
      return;
    }
    merges.push(merge);
  }

  const restoreOriginals = () => {
    for (const merge of merges) writeFileSync(join(cwd, merge.file), merge.original);
  };
  for (const merge of merges) writeFileSync(join(cwd, merge.file), merge.headContent);
  // The rewritten files carry a new stat, which `reset --keep` reads as an edit it cannot overwrite until the index is
  // Refreshed. The refresh exits non-zero whenever any other file is dirty, which is the usual case, so it is not read
  getResult(() => runGit(["update-index", "--refresh"], cwd)).unwrapOr("");
  if (runGit(["rev-parse", "HEAD"], cwd).trim() !== head) {
    restoreOriginals();
    console.info("the checkout's branch waits: a commit landed while the sync ran, and the push it queued carries it");
    return;
  }

  const isReset = getResult(() => runGit(["reset", "--keep", target], cwd)).match(
    () => true,
    () => false,
  );
  if (!isReset) {
    restoreOriginals();
    console.info("the checkout's branch waits: the push landed, but git refused the reset over an uncommitted file");
    return;
  }
  for (const merge of merges) writeFileSync(join(cwd, merge.file), merge.merged);

  console.info(landed.length > 0 ? `${synced}, with ${landed.length} commit(s) that landed during the push` : synced);
};
