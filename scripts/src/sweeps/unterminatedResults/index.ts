import { REPOSITORY_ROOT } from "#src/services/constants";
import { getSweepFilePaths } from "#src/sweeps/getSweepFilePaths";
import { getUnterminatedResults } from "#src/sweeps/unterminatedResults/getUnterminatedResults";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SourcePrefixes = ["apps/web/app/", "apps/web/server/", "apps/web/shared/"];
const SOURCE_REGEX = /^(?:apps|packages)\/[^/]+\/src\//u;
const checkIsInScope = (path: string) =>
  !path.includes(".test.") && (SOURCE_REGEX.test(path) || SourcePrefixes.some((prefix) => path.startsWith(prefix)));

// Prints rather than exits non-zero, like the other sweep scans: a hit is a chain to read against what the
// Enclosing function does with it, and the ledger carries the standing exclusions
// (`.agents/ledgers/error-handling.md`).
for (const path of [...getSweepFilePaths("*.ts"), ...getSweepFilePaths("*.vue")].filter((filePath) =>
  checkIsInScope(filePath),
))
  for (const { after, line } of getUnterminatedResults(readFileSync(resolve(REPOSITORY_ROOT, path), "utf8")))
    console.info(`${path}:${line.toString()}  after: ${after}`);
