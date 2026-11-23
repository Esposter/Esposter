import type { LedgerSample } from "#src/models/sweeps/ledgerCoverage/LedgerSample";

import { splitNonBlankLines } from "#src/services/shared/splitNonBlankLines";
import { parseLedgerSample } from "#src/services/sweeps/ledgerCoverage/parseLedgerSample";
import { readFileSync } from "node:fs";

// The sample lines a file holds, a sample's output or a batch cut from it, in the order the file lists them
export const readLedgerSample = (path: string): LedgerSample[] =>
  splitNonBlankLines(readFileSync(path, "utf8")).map(({ line, lineNumber }) =>
    parseLedgerSample(line, `${path}:${lineNumber}`),
  );
