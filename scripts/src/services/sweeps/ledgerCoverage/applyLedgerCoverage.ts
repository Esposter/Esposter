import type { LedgerCoverage } from "#src/models/sweeps/ledgerCoverage/LedgerCoverage";
import type { LedgerEvent } from "#src/models/sweeps/ledgerCoverage/LedgerEvent";
import type { LedgerFile } from "#src/models/sweeps/ledgerCoverage/LedgerFile";

import { applyLedgerEvents } from "#src/services/sweeps/ledgerCoverage/applyLedgerEvents";
import { LedgerUnitsMap } from "#src/services/sweeps/ledgerCoverage/LedgerUnitsMap";
import { syncLedgerUnits } from "#src/services/sweeps/ledgerCoverage/syncLedgerUnits";

// Dates the rows of every file by the events, syncing a derived ledger's rows to the tree first. An event is matched by
// A row of any file: a trailer naming a folder's ledger reaches every file under it, and a unit is a row in exactly one.
// A reopen naming no unit dates nothing and is never reported, since the file it names is the whole of its target.
export const applyLedgerCoverage = (events: LedgerEvent[], ledgerFiles: LedgerFile[]): LedgerCoverage => {
  const matchedEvents = new Set<LedgerEvent>();
  const files = ledgerFiles.map((file) => {
    const getUnits = LedgerUnitsMap[file.ledger];
    const syncedText = getUnits ? syncLedgerUnits(file.text, getUnits()) : file.text;
    const { matched, text: rewrittenText } = applyLedgerEvents(syncedText, file.ledger, events);
    for (const event of matched) matchedEvents.add(event);
    return { ...file, rewrittenText };
  });
  return { files, unmatched: events.filter((event) => event.unit !== undefined && !matchedEvents.has(event)) };
};
