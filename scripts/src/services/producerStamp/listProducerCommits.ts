import type { ProducerStaleness } from "#src/models/producerStamp/ProducerStaleness";
import type { Except } from "type-fest";

import { readCommitPatch } from "#src/services/coderabbit/collect/readCommitPatch";
import { PRODUCER_STALE_WINDOW_DAYS } from "#src/services/producerStamp/constants";
import { checkIsAncestor } from "#src/services/shared/checkIsAncestor";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

const readCommitLines = (args: string[]): string[] =>
  runGit(["log", "--format=%h %s", ...args])
    .split("\n")
    .filter(Boolean);

const getLineSubject = (line: string): string => line.slice(line.indexOf(" ") + 1);

const checkIsKnown = (commit: string): boolean =>
  getResult(() => runGit(["rev-parse", "--verify", "--quiet", `${commit}^{commit}`])).match(
    () => true,
    () => false,
  );

const listRecentCommits = (producerPaths: string[]): Except<ProducerStaleness, "stamp"> => ({
  commits: readCommitLines(["HEAD", `--since=${PRODUCER_STALE_WINDOW_DAYS} days ago`, "--", ...producerPaths]),
  isApproximate: true,
});

// The commit on HEAD a rewrite of the queue replayed the stamp's commit as: one with its subject that carries its very
// Change, since a subject alone can name an unrelated commit. Undefined for a commit with no change to compare by
const findRewrittenCommit = (commit: string): string | undefined => {
  const { patchId } = readCommitPatch(commit);
  if (!patchId) return undefined;
  const subject = runGit(["log", "-1", "--format=%s", commit]).trim();
  return runGit(["log", "HEAD", "--format=%H %s", "--fixed-strings", `--grep=${subject}`])
    .split("\n")
    .filter((line) => line && getLineSubject(line) === subject)
    .map((line) => line.slice(0, line.indexOf(" ")))
    .find((sha) => readCommitPatch(sha).patchId === patchId);
};

// The commits to a producer's paths since its stamp's commit, each `<short sha> <subject>`. A commit still on the branch
// Is listed from its own ancestry, and one the queue rewrote from its replay's, found by its subject and its change. One
// Git does not know, or whose replay is not on the branch, lists the window's commits, as an approximation
export const listProducerCommits = (commit: string, producerPaths: string[]): Except<ProducerStaleness, "stamp"> => {
  if (!checkIsKnown(commit)) return listRecentCommits(producerPaths);
  const baseCommit = checkIsAncestor(commit, "HEAD") ? commit : findRewrittenCommit(commit);
  return baseCommit === undefined
    ? listRecentCommits(producerPaths)
    : { commits: readCommitLines([`${baseCommit}..HEAD`, "--", ...producerPaths]), isApproximate: false };
};
