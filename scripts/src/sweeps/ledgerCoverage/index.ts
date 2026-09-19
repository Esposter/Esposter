import type { LedgerEvent } from "#src/models/sweeps/ledgerCoverage/LedgerEvent";

import { LedgerEventType } from "#src/models/sweeps/ledgerCoverage/LedgerEventType";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { getSweepFilePaths } from "#src/services/sweeps/getSweepFilePaths";
import { applyLedgerEvents } from "#src/services/sweeps/ledgerCoverage/applyLedgerEvents";
import { getLedgerEvents } from "#src/services/sweeps/ledgerCoverage/getLedgerEvents";
import { LedgerUnitsMap } from "#src/services/sweeps/ledgerCoverage/LedgerUnitsMap";
import { syncLedgerUnits } from "#src/services/sweeps/ledgerCoverage/syncLedgerUnits";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// Oldest first so a later trailer wins, ordered and dated by author date so a rebase moves neither — the default
// Traversal is committer-dated, which replays a rebased pass after the reopen that was meant to undo it — and only
// The commits carrying a trailer at all: git matches `--grep` per line, so the anchor holds it to the block's shape
const log = runGit([
  "log",
  "--reverse",
  "--author-date-order",
  "--format=%as%x1F%B%x1E",
  ...Object.values(LedgerEventType).map((type) => `--grep=^${type}: `),
]);
const events = getLedgerEvents(log);
const matchedEvents = new Set<LedgerEvent>();

for (const ledgerPath of getSweepFilePaths(`${LEDGER_DIRECTORY}/*.md`).filter((path) => !path.endsWith("README.md"))) {
  const ledger = ledgerPath.slice(LEDGER_DIRECTORY.length + 1, -".md".length);
  const absolutePath = resolve(REPOSITORY_ROOT, ledgerPath);
  const text = readFileSync(absolutePath, "utf8");
  // A derived ledger's rows are the tree's before any trailer dates them, so a unit added since opens at `—` and
  // One removed goes, with no row anyone edits by hand
  const getUnits = LedgerUnitsMap[ledger];
  const synced = getUnits ? syncLedgerUnits(text, getUnits()) : text;
  const { matched, text: rewritten } = applyLedgerEvents(synced, ledger, events);
  for (const event of matched) matchedEvents.add(event);
  if (rewritten === text) continue;

  writeFileSync(absolutePath, rewritten);
  console.info(ledgerPath);
}

// Reported once the whole tree has been read, because a trailer naming a ledger that is now a coverage folder is
// In scope for every area file in it and a row in one — reporting per file would call it unmatched in the rest
for (const event of events)
  if (event.unit !== undefined && !matchedEvents.has(event))
    console.info(`unmatched ${event.ledger}: ${event.unit} (${event.date})`);
