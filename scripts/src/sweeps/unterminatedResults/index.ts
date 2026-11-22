import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { checkIsInScope } from "#src/services/sweeps/unterminatedResults/checkIsInScope";
import { getUnterminatedResults } from "#src/services/sweeps/unterminatedResults/getUnterminatedResults";
import { maskOutsideScript } from "#src/services/sweeps/unterminatedResults/maskOutsideScript";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Prints rather than exits non-zero, like the other sweep scans: a hit is a chain to read against what the
// Enclosing function does with it, and the ledger carries the standing exclusions
// (`.agents/ledgers/error-handling.md`).
await runCommand(
  defineCommand({
    meta: {
      description: "Print each Result that nothing terminates, with its line and the code it follows",
      name: "ai:sweep:unterminated-results",
    },
    run: () => {
      for (const path of readSweepFilePaths("*.ts", "*.vue").filter((filePath) => checkIsInScope(filePath))) {
        const text = readFileSync(resolve(REPOSITORY_ROOT, path), "utf8");
        const scannedText = path.endsWith(".vue") ? maskOutsideScript(text) : text;
        for (const { after, line } of getUnterminatedResults(scannedText))
          console.info(`${path}:${line}  after: ${after}`);
      }
    },
  }),
);
