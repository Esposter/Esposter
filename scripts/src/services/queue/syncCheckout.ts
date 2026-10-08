import { checkIsAncestor } from "#src/services/coderabbit/collect/checkIsAncestor";
import { QUEUE_BRANCH } from "#src/services/coderabbit/collect/constants";
import { carryCommit } from "#src/services/queue/carryCommit";
import { mergeWorkingCopy } from "#src/services/queue/mergeWorkingCopy";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// One file of the checkout's uncommitted edit, held in memory across the reset: `headContent` is what the reset needs the
// File to be, `merged` is the edit carried onto the pushed tip, and `original` is what a refused sync puts back
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
const readDirtyMerge = (file: string, head: string, pushed: string, cwd: string): DirtyMerge | undefined => {
  const headContent = readBlob(head, file, cwd);
  const pushedContent = readBlob(pushed, file, cwd);
  const original = getResult(() => readFileSync(join(cwd, file), "utf8")).unwrapOr(undefined);
  if (headContent === undefined || pushedContent === undefined || original === undefined) return undefined;

  const isBinaryFile = [headContent, pushedContent, original].some((content) => content.includes("\0"));
  if (isBinaryFile) return undefined;

  const merged = mergeWorkingCopy(original, headContent, pushedContent);
  return merged === undefined ? undefined : { file, headContent, merged, original };
};

// Moves the checkout's branch onto `pushed`, the commit the push just carried, then carries on top of it what landed
// On the branch since `base`, the head the replay started from. A branch already holding `pushed` is left alone, since
// `--keep` resets the index even onto the commit it stands at and would unstage another session's staged work. `--keep`
// Is the only reset that can run over another session's uncommitted work: it moves the branch and updates just the
// Files that differ between the two commits, and it refuses rather than overwrite an edit. So an edit to a file the
// Pushed commit changes is three-way merged onto the pushed tip first, and the reset runs with that file at HEAD's
// Content. Where the merge conflicts, or a commit that landed since `base` touched the file, the sync refuses and
// Changes nothing. The reset takes what landed during the push off the branch, so those commits are carried back on
// Top; a pick that conflicts stops the carrying and stays reachable from the reflog.
export const syncCheckout = (pushed: string, base: string, cwd: string): void => {
  const synced = `synced ${QUEUE_BRANCH} onto ${pushed}`;
  if (checkIsAncestor(pushed, "HEAD", cwd)) {
    console.info(synced);
    return;
  }

  const head = runGit(["rev-parse", "HEAD"], cwd).trim();
  const pushedFiles = new Set(readChangedPaths([head, pushed], cwd));
  const landedFiles = new Set(readChangedPaths([base, head], cwd));
  const editedFiles = readChangedPaths([head], cwd);
  const overlappingFiles = editedFiles.filter((editedFile) => pushedFiles.has(editedFile));
  const merges: DirtyMerge[] = [];
  for (const file of overlappingFiles) {
    // A landed commit that touched the file would be carried back over the edit, and that carry would stop on it
    const merge = landedFiles.has(file) ? undefined : readDirtyMerge(file, head, pushed, cwd);
    if (merge === undefined) {
      console.info(
        `the checkout's branch waits: ${file} has an uncommitted edit that cannot be synced over the push, nothing changed`,
      );
      return;
    }
    merges.push(merge);
  }

  for (const merge of merges) writeFileSync(join(cwd, merge.file), merge.headContent);
  // The rewritten files carry a new stat, which `reset --keep` reads as an edit it cannot overwrite until the index is
  // Refreshed. The refresh exits non-zero whenever any other file is dirty, which is the usual case, so it is not read
  getResult(() => runGit(["update-index", "--refresh"], cwd)).unwrapOr("");
  const isReset = getResult(() => runGit(["reset", "--keep", pushed], cwd)).match(
    () => true,
    () => false,
  );
  if (!isReset) {
    for (const merge of merges) writeFileSync(join(cwd, merge.file), merge.original);
    console.info("the checkout's branch waits: the push landed, but git refused the reset over an uncommitted file");
    return;
  }
  for (const merge of merges) writeFileSync(join(cwd, merge.file), merge.merged);

  // The tip the reset moved off, as the reset itself recorded it, so a commit that landed after any earlier read of
  // `HEAD` is still in the range carried back
  const tip = runGit(["rev-parse", "ORIG_HEAD"], cwd).trim();
  const landed = getNonEmptyLines(runGit(["rev-list", "--reverse", `${base}..${tip}`], cwd));
  // `find` stops at the first commit that does not carry, which is the one the message names
  const conflicted = landed.find((commit) => !carryCommit(commit, cwd));
  if (conflicted !== undefined)
    console.info(
      `${synced}, stopped carrying at ${conflicted}, which does not apply on top of it — it stays in the reflog`,
    );
  else if (landed.length > 0)
    console.info(`${synced}, carrying ${landed.length} commit(s) that landed during the push`);
  else console.info(synced);
};
