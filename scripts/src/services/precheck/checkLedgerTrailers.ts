import { REMOTE_QUEUE_REF } from "#src/services/shared/constants";
import { getUnmatchedLedgerEvents } from "#src/services/sweeps/ledgerCoverage/getUnmatchedLedgerEvents";
import { readLedgerEvents } from "#src/services/sweeps/ledgerCoverage/readLedgerEvents";
import { readLedgerUnitsByLedger } from "#src/services/sweeps/ledgerCoverage/readLedgerUnitsByLedger";

// The ledger trailers of the commits this checkout would land, each naming a unit a ledger holds. A trailer naming no
// Unit dates nothing, and the status only reports it, so a sitting that wrote one would under-report without a sign.
// Only the commits not yet on the queue are read: the older trailers the status already reports stay its question, not
// This landing's. The precheck runs after the queue is fetched, so the queue's ref is current
export const checkLedgerTrailers = (): string[] =>
  getUnmatchedLedgerEvents(readLedgerEvents([`${REMOTE_QUEUE_REF}..HEAD`]), readLedgerUnitsByLedger()).map(
    ({ date, ledger, unit }) =>
      `unmatched ledger trailer ${ledger} | ${unit} (${date}): the unit names no row, so spell the unit as the ledger holds it`,
  );
