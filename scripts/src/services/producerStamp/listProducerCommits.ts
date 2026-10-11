import type { ProducerStaleness } from "#src/models/producerStamp/ProducerStaleness";
import type { Except } from "type-fest";

import { readCommitPatch } from "#src/services/coderabbit/collect/readCommitPatch";
import { PRODUCER_STALE_WINDOW_DAYS } from "#src/services/producerStamp/constants";
import { checkIsAncestor } from "#src/services/shared/checkIsAncestor";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

const readCommitLines = (args: string[], cwd?: string): string[] =>
  runGit(["log", "--format=%h %s", ...args], cwd)
    .split("\n")
    .filter(Boolean);

const getLineSubject = (line: string): string => line.slice(line.indexOf(" ") + 1);

const checkIsKnown = (commit: string, cwd?: string): boolean =>
  getResult(() => runGit(["rev-parse", "--verify", "--quiet", `${commit}^{commit}`], cwd)).match(
    () => true,
    () => false,
  );

const listRecentCommits = (producerPaths: string[], cwd?: string): Except<ProducerStaleness, "stamp"> => ({
  commits: readCommitLines(["HEAD", `--since=${PRODUCER_STALE_WINDOW_DAYS} days ago`, "--", ...producerPaths], cwd),
  isApproximate: true,
});

// The commit on HEAD a rewrite of the queue replayed the stamp's commit as: the one with its subject that carries its
// Very change, since a subject alone can name an unrelated commit. Undefined for a commit with no change to compare by,
// And for one HEAD holds two such commits of, since a change applied again could be either and neither is known the replay
const findRewrittenCommit = (commit: string, cwd?: string): string | undefined => {
  const { patchId } = readCommitPatch(commit, cwd);
  if (!patchId) return undefined;
  const subject = runGit(["log", "-1", "--format=%s", commit], cwd).trim();
  const replays = runGit(["log", "HEAD", "--format=%H %s", "--fixed-strings", `--grep=${subject}`], cwd)
    .split("\n")
    .filter((line) => line && getLineSubject(line) === subject)
    .map((line) => line.slice(0, line.indexOf(" ")))
    .filter((sha) => readCommitPatch(sha, cwd).patchId === patchId);
  return replays.length === 1 ? replays[0] : undefined;
};

// The commits to a producer's paths since its stamp's commit, each `<short sha> <subject>`. A commit still on the branch
// Is listed from its own ancestry, and one the queue rewrote from its replay's, found by its subject and its change. One
// Git does not know, or whose one replay is not on the branch, lists the window's commits, as an approximation
export const listProducerCommits = (
  commit: string,
  producerPaths: string[],
  cwd?: string,
): Except<ProducerStaleness, "stamp"> => {
  if (!checkIsKnown(commit, cwd)) return listRecentCommits(producerPaths, cwd);
  const baseCommit = checkIsAncestor(commit, "HEAD", cwd) ? commit : findRewrittenCommit(commit, cwd);
  return baseCommit === undefined
    ? listRecentCommits(producerPaths, cwd)
    : { commits: readCommitLines([`${baseCommit}..HEAD`, "--", ...producerPaths], cwd), isApproximate: false };
};
