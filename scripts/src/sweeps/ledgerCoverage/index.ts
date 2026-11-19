import { applyLedgerCoverage } from "#src/services/sweeps/ledgerCoverage/applyLedgerCoverage";
import { readLedgerEvents } from "#src/services/sweeps/ledgerCoverage/readLedgerEvents";
import { readLedgerFiles } from "#src/services/sweeps/ledgerCoverage/readLedgerFiles";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { timeCommand } from "#src/services/timing/timeCommand";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

timeCommand("ai:sweep:ledger-coverage");

const { files, unmatched } = applyLedgerCoverage(readLedgerEvents(), readLedgerFiles());
for (const { ledgerPath, rewrittenText, text } of files) {
  if (rewrittenText === text) continue;

  writeFileSync(resolve(REPOSITORY_ROOT, ledgerPath), rewrittenText);
  console.info(ledgerPath);
}
// Reported once the whole tree has been read, because a trailer naming a ledger that is now a coverage folder is
// In scope for every area file in it and a row in one — reporting per file would call it unmatched in the rest
for (const event of unmatched) console.info(`unmatched ${event.ledger}: ${event.unit} (${event.date})`);
