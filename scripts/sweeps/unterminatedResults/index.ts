import { getSweepFilePaths } from "#scripts/sweeps/getSweepFilePaths";
import { getUnterminatedResults } from "#scripts/sweeps/unterminatedResults/getUnterminatedResults";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SourcePrefixes = ["packages/app/app/", "packages/app/server/", "packages/app/shared/"];
const SOURCE_REGEX = /^packages\/[^/]+\/src\//u;
const root = resolve(import.meta.dirname, "..", "..", "..");
const checkIsInScope = (path: string) =>
  !path.includes(".test.") && (SOURCE_REGEX.test(path) || SourcePrefixes.some((prefix) => path.startsWith(prefix)));

// Prints rather than exits non-zero, like the other sweep scans: a hit is a chain to read against what the
// Enclosing function does with it, and the ledger carries the standing exclusions
// (`.agents/ledgers/error-handling.md`).
for (const path of [...getSweepFilePaths("*.ts"), ...getSweepFilePaths("*.vue")].filter((filePath) =>
  checkIsInScope(filePath),
))
  for (const { after, line } of getUnterminatedResults(readFileSync(resolve(root, path), "utf8")))
    console.info(`${path}:${line.toString()}  after: ${after}`);
