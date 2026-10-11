import { getDuplicateCodeFindingLine } from "#src/services/sweeps/duplicateCode/getDuplicateCodeFindingLine";
import { readDuplicateCodeFindings } from "#src/services/sweeps/duplicateCode/readDuplicateCodeFindings";
import { defineCommand, runMain } from "citty";

// Prints rather than exits non-zero: a finder for the sweep rather than its gate, since the pass reads the list and
// Decides which of two copies owns the code (`.agents/ledgers/quality/duplicate-code.md`).
await runMain(
  defineCommand({
    meta: {
      description: "Lists the code two files share, longest first, with tests and import blocks left out",
      name: "ai:sweep:duplicate-code",
    },
    run() {
      const findings = readDuplicateCodeFindings();
      for (const finding of findings) console.info(getDuplicateCodeFindingLine(finding));
      console.info(`${findings.length} findings`);
    },
  }),
);
