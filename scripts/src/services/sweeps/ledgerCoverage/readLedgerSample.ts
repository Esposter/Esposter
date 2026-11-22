import type { LedgerSample } from "#src/models/sweeps/ledgerCoverage/LedgerSample";

import { parseLedgerSample } from "#src/services/sweeps/ledgerCoverage/parseLedgerSample";
import { readFileSync } from "node:fs";

// The sample lines a file holds, a sample's output or a batch cut from it, in the order the file lists them
export const readLedgerSample = (path: string): LedgerSample[] =>
  readFileSync(path, "utf8")
    .split("\n")
    .flatMap((line, index) => (line.trim() === "" ? [] : [parseLedgerSample(line, `${path}:${index + 1}`)]));
