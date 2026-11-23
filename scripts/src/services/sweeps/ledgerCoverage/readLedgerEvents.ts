import type { LedgerEvent } from "#src/models/sweeps/ledgerCoverage/LedgerEvent";

import { LedgerEventTypes } from "#src/models/sweeps/ledgerCoverage/LedgerEventType";
import { runGit } from "#src/services/shared/runGit";
import { getLedgerEvents } from "#src/services/sweeps/ledgerCoverage/getLedgerEvents";
import { readLedgerAreas } from "#src/services/sweeps/ledgerCoverage/readLedgerAreas";

// Oldest first, so a later trailer wins, and dated by author date, so a rebase moves neither.
// The default traversal is committer-dated, which replays a rebased pass after the reopen that was meant to undo it.
// Only commits with a line opening on a trailer key are read.
// Git matches `--grep` per line, so it cannot hold the match to a trailer block.
// `getLedgerEvents` reads every such line.
// A trailer often sits in a paragraph of its own above the co-author lines.
// `git interpret-trailers` does not read a trailer in such a paragraph.
// The range is the commits to read, all of history by default.
export const readLedgerEvents = (revisionRange: string[] = []): LedgerEvent[] =>
  getLedgerEvents(
    runGit([
      "log",
      "--reverse",
      "--author-date-order",
      "--format=%as%x1F%B%x1E",
      ...revisionRange,
      ...LedgerEventTypes.map((type) => `--grep=^${type}: `),
    ]),
    readLedgerAreas(),
  );
