import { REMOTE_QUEUE_REF } from "#src/services/shared/constants";
import { applyLedgerCoverage } from "#src/services/sweeps/ledgerCoverage/applyLedgerCoverage";
import { readLedgerEvents } from "#src/services/sweeps/ledgerCoverage/readLedgerEvents";
import { readLedgerFiles } from "#src/services/sweeps/ledgerCoverage/readLedgerFiles";

// The ledger trailers of the commits this checkout would land, each naming a row the tree holds. A trailer naming no row
// Dates nothing, and the coverage sweep only reports it, so a sitting that wrote one would under-report without a sign.
// Only the commits not yet on the queue are read: the older trailers the sweep already reports stay its question, not this
// Landing's. The precheck runs after the queue is fetched, so the queue's ref is current
export const checkLedgerTrailers = (): string[] =>
  applyLedgerCoverage(readLedgerEvents([`${REMOTE_QUEUE_REF}..HEAD`]), readLedgerFiles()).unmatched.map(
    ({ date, ledger, unit }) =>
      `unmatched ledger trailer ${ledger} | ${unit} (${date}): the unit names no row, so spell the row's cell as the ledger holds it`,
  );
