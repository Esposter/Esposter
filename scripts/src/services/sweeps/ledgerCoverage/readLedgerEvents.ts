import type { LedgerEvent } from "#src/models/sweeps/ledgerCoverage/LedgerEvent";

import { LedgerEventTypes } from "#src/models/sweeps/ledgerCoverage/LedgerEventType";
import { runGit } from "#src/services/shared/runGit";
import { getLedgerEvents } from "#src/services/sweeps/ledgerCoverage/getLedgerEvents";

// Oldest first so a later trailer wins, ordered and dated by author date so a rebase moves neither — the default
// Traversal is committer-dated, which replays a rebased pass after the reopen that was meant to undo it — and only
// The commits with a line opening on a trailer key: git matches `--grep` per line, so it cannot hold the match to a
// Trailer block. getLedgerEvents reads every such line, since a trailer often sits in a paragraph of its own above the
// Co-author lines, which `git interpret-trailers` does not read. The range is the commits to read, all of history by default
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
  );
