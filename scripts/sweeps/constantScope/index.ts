import { getModuleScopeConstants } from "#scripts/sweeps/constantScope/getModuleScopeConstants";
import { getSweepFilePaths } from "#scripts/sweeps/getSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// `getSweepFilePaths` pins its own cwd to the repository root, so the paths it answers are relative to that rather
// Than to wherever this script was started from
const root = resolve(import.meta.dirname, "..", "..", "..");

// Prints rather than exits non-zero: a clean pass here is a *known* list rather than an empty one, because the
// Sanctioned exceptions — a hoisted `vi.mock` factory's binding, a top-level-await fixture — are reported too.
// The ledger names them (`.agents/ledgers/testing/README.md`); what makes them exceptions is a read, not a flag.
for (const path of getSweepFilePaths("*.test.ts"))
  for (const { line, name } of getModuleScopeConstants(readFileSync(resolve(root, path), "utf8")))
    console.info(`${path}:${line.toString()}: ${name}`);
