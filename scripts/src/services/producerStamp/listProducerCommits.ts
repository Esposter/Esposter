import type { ProducerStaleness } from "#src/models/producerStamp/ProducerStaleness";

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

const listRecentCommits = (producerPaths: string[]): Omit<ProducerStaleness, "stamp"> => ({
  commits: readCommitLines(["HEAD", `--since=${PRODUCER_STALE_WINDOW_DAYS} days ago`, "--", ...producerPaths]),
  isApproximate: true,
});

// The commits to a producer's paths since its stamp's commit, each `<short sha> <subject>`. A commit still on the branch
// Is listed from its own ancestry. One the queue rewrote is found again by its subject, and its newer commits are the
// Ones above that match. One git does not know at all lists the window's commits, as an approximation
export const listProducerCommits = (commit: string, producerPaths: string[]): Omit<ProducerStaleness, "stamp"> => {
  if (!checkIsKnown(commit)) return listRecentCommits(producerPaths);
  if (checkIsAncestor(commit, "HEAD"))
    return { commits: readCommitLines([`${commit}..HEAD`, "--", ...producerPaths]), isApproximate: false };
  const subject = runGit(["log", "-1", "--format=%s", commit]).trim();
  const lines = readCommitLines(["HEAD", "--", ...producerPaths]);
  const subjectIndex = lines.findIndex((line) => getLineSubject(line) === subject);
  return subjectIndex === -1
    ? listRecentCommits(producerPaths)
    : { commits: lines.slice(0, subjectIndex), isApproximate: false };
};
