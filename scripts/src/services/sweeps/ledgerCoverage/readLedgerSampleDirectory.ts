import type { LedgerSample } from "#src/models/sweeps/ledgerCoverage/LedgerSample";

import { listFilesBySuffix } from "#src/services/shared/listFilesBySuffix";
import { BATCH_FILE_EXTENSION } from "#src/services/sweeps/ledgerCoverage/constants";
import { readLedgerSample } from "#src/services/sweeps/ledgerCoverage/readLedgerSample";
import { join } from "node:path";

// The units every batch file in the directory was handed, in the order the batch files sort, so a judgement can be
// Matched against the cells its reader was given rather than every cell the status holds
export const readLedgerSampleDirectory = (directory: string): LedgerSample[] =>
  listFilesBySuffix(directory, BATCH_FILE_EXTENSION).flatMap((name) => readLedgerSample(join(directory, name)));
