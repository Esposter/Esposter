import type { LedgerSample } from "#src/models/sweeps/ledgerCoverage/LedgerSample";

import { SAMPLE_LEDGER_SEPARATOR, SAMPLE_UNIT_SEPARATOR } from "#src/services/sweeps/ledgerCoverage/constants";

/**
 * A sample's unit and the questions it is judged for, as `ai:sweep:sample` prints it and `parseLedgerSample` reads it
 * back.
 */
export const formatLedgerSample = ({ ledgers, unit }: LedgerSample): string =>
  `${unit}${SAMPLE_UNIT_SEPARATOR}${ledgers.join(SAMPLE_LEDGER_SEPARATOR)}`;
