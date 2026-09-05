import { getSweepFilePaths } from "#scripts/sweeps/getSweepFilePaths";
import { getUnterminatedResults } from "#scripts/sweeps/unterminatedResults/getUnterminatedResults";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SOURCE_PREFIXES = ["packages/app/app/", "packages/app/server/", "packages/app/shared/"];
const SOURCE_REGEX = /^packages\/[^/]+\/src\//u;
const root = resolve(import.meta.dirname, "..", "..", "..");
const checkIsInScope = (path: string) =>
  !path.includes(".test.") && (SOURCE_REGEX.test(path) || SOURCE_PREFIXES.some((prefix) => path.startsWith(prefix)));

// Prints rather than exits non-zero: what it still reports is the chain assigned to a named `const` and
// Terminated on a later line, which is the repo's own preference over nesting the call inside its terminator.
// The ledger names them (`.agents/ledgers/error-handling.md`); telling one from a finding is a read.
for (const path of [...getSweepFilePaths("*.ts"), ...getSweepFilePaths("*.vue")].filter((path) => checkIsInScope(path)))
  for (const { after, line } of getUnterminatedResults(readFileSync(resolve(root, path), "utf8")))
    console.info(`${path}:${line.toString()}  after: ${after}`);
