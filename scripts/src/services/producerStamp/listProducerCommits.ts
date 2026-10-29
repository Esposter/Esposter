import type { ProducerStaleness } from "#src/models/producerStamp/ProducerStaleness";
import type { Except } from "type-fest";

import { checkIsAncestor } from "#src/services/producerStamp/checkIsAncestor";
import { checkIsKnown } from "#src/services/producerStamp/checkIsKnown";
import { listRecentCommits } from "#src/services/producerStamp/listRecentCommits";
import { readCommitLines } from "#src/services/producerStamp/readCommitLines";

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
