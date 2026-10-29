import type { ProducerStaleness } from "#src/models/producerStamp/ProducerStaleness";
import type { Except } from "type-fest";

import { PRODUCER_STALE_WINDOW_DAYS } from "#src/services/producerStamp/constants";
import { readCommitLines } from "#src/services/producerStamp/readCommitLines";

export const listRecentCommits = (producerPaths: string[], cwd?: string): Except<ProducerStaleness, "stamp"> => ({
  commits: readCommitLines(["HEAD", `--since=${PRODUCER_STALE_WINDOW_DAYS} days ago`, "--", ...producerPaths], cwd),
  isApproximate: true,
});
