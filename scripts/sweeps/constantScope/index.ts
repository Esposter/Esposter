import { getModuleScopeConstants } from "#scripts/sweeps/constantScope/getModuleScopeConstants";
import { getSweepFilePaths } from "#scripts/sweeps/getSweepFilePaths";
import { readFileSync } from "node:fs";

// Prints rather than exits non-zero: a clean pass here is a *known* list rather than an empty one, because the
// Sanctioned exceptions — a hoisted `vi.mock` factory's binding, a top-level-await fixture — are reported too.
// The ledger names them (`.agents/ledgers/testing/README.md`); what makes them exceptions is a read, not a flag.
for (const path of getSweepFilePaths("*.test.ts"))
  for (const { line, name } of getModuleScopeConstants(readFileSync(path, "utf8")))
    console.info(`${path}:${line.toString()}: ${name}`);
