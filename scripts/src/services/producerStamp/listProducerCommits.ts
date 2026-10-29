import type { ProducerStaleness } from "#src/models/producerStamp/ProducerStaleness";
import type { Except } from "type-fest";

import { checkIsAncestor } from "#src/services/producerStamp/checkIsAncestor";
import { PRODUCER_STALE_WINDOW_DAYS } from "#src/services/producerStamp/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

const readCommitLines = (args: string[], cwd?: string): string[] =>
  runGit(["log", "--format=%h %s", ...args], cwd)
    .split("\n")
    .filter(Boolean);

const checkIsKnown = (commit: string, cwd?: string): boolean =>
  getResult(() => runGit(["rev-parse", "--verify", "--quiet", `${commit}^{commit}`], cwd)).match(
    () => true,
    () => false,
  );

const listRecentCommits = (producerPaths: string[], cwd?: string): Except<ProducerStaleness, "stamp"> => ({
  commits: readCommitLines(["HEAD", `--since=${PRODUCER_STALE_WINDOW_DAYS} days ago`, "--", ...producerPaths], cwd),
  isApproximate: true,
});

// The commits to a producer's paths since its stamp's commit, each `<short sha> <subject>`. A commit HEAD holds is
// Listed from its own ancestry. One git does not know, or HEAD does not hold, lists the window's commits, as an approximation
export const listProducerCommits = (
  commit: string,
  producerPaths: string[],
  cwd?: string,
): Except<ProducerStaleness, "stamp"> =>
  !checkIsKnown(commit, cwd) || !checkIsAncestor(commit, "HEAD", cwd)
    ? listRecentCommits(producerPaths, cwd)
    : { commits: readCommitLines([`${commit}..HEAD`, "--", ...producerPaths], cwd), isApproximate: false };
