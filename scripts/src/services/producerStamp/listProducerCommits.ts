import { PRODUCER_STALE_WINDOW_DAYS, SHORT_SHA_LENGTH } from "#src/services/producerStamp/constants";
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

const checkIsAncestor = (commit: string): boolean =>
  getResult(() => runGit(["merge-base", "--is-ancestor", commit, "HEAD"])).match(
    () => true,
    () => false,
  );

const listRecentCommits = (commit: string, producerPaths: string[]): string[] => [
  `${commit.slice(0, SHORT_SHA_LENGTH)} is not on this branch; listing recent changes`,
  ...readCommitLines(["HEAD", `--since=${PRODUCER_STALE_WINDOW_DAYS} days ago`, "--", ...producerPaths]),
];

// The commits to a producer's paths since its stamp's commit, each `<short sha> <subject>`. A commit still on the branch
// Is listed from its own ancestry. One the queue rewrote is found again by its subject, and its newer commits are the
// Ones above that match. One git does not know at all lists the window's commits, first saying so
export const listProducerCommits = (commit: string, producerPaths: string[]): string[] => {
  if (!checkIsKnown(commit)) return listRecentCommits(commit, producerPaths);
  if (checkIsAncestor(commit)) return readCommitLines([`${commit}..HEAD`, "--", ...producerPaths]);
  const subject = runGit(["log", "-1", "--format=%s", commit]).trim();
  const lines = readCommitLines(["HEAD", "--", ...producerPaths]);
  const subjectIndex = lines.findIndex((line) => getLineSubject(line) === subject);
  return subjectIndex === -1 ? listRecentCommits(commit, producerPaths) : lines.slice(0, subjectIndex);
};
