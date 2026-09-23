import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { checkIsInScope } from "#src/services/sweeps/unterminatedResults/checkIsInScope";
import { getUnterminatedResults } from "#src/services/sweeps/unterminatedResults/getUnterminatedResults";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Prints rather than exits non-zero, like the other sweep scans: a hit is a chain to read against what the
// Enclosing function does with it, and the ledger carries the standing exclusions
// (`.agents/ledgers/error-handling.md`).
for (const path of readSweepFilePaths("*.ts", "*.vue").filter((filePath) => checkIsInScope(filePath)))
  for (const { after, line } of getUnterminatedResults(readFileSync(resolve(REPOSITORY_ROOT, path), "utf8")))
    console.info(`${path}:${line}  after: ${after}`);
