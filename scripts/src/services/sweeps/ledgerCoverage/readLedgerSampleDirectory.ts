import type { LedgerSample } from "#src/models/sweeps/ledgerCoverage/LedgerSample";

import { BATCH_FILE_EXTENSION } from "#src/services/sweeps/ledgerCoverage/constants";
import { readLedgerSample } from "#src/services/sweeps/ledgerCoverage/readLedgerSample";
import { compareText } from "@esposter/shared";
import { readdirSync } from "node:fs";
import { join } from "node:path";

// The units every batch file in the directory was handed, in the order the batch files sort, so a judgement can be
// Matched against the cells its reader was given rather than every cell the status holds
export const readLedgerSampleDirectory = (directory: string): LedgerSample[] =>
  readdirSync(directory)
    .filter((name) => name.endsWith(BATCH_FILE_EXTENSION))
    .toSorted(compareText)
    .flatMap((name) => readLedgerSample(join(directory, name)));
