import { getBatches } from "#src/services/shared/getBatches";
import { parseWholeCount } from "#src/services/shared/parseWholeCount";
import { resolveInvocationPath } from "#src/services/shared/resolveInvocationPath";
import { writeFileAtomically } from "#src/services/shared/writeFileAtomically";
import { BATCH_FILE_EXTENSION } from "#src/services/sweeps/ledgerCoverage/constants";
import { formatBatchFileName } from "#src/services/sweeps/ledgerCoverage/formatBatchFileName";
import { formatLedgerSample } from "#src/services/sweeps/ledgerCoverage/formatLedgerSample";
import { readLedgerSample } from "#src/services/sweeps/ledgerCoverage/readLedgerSample";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";
import { join } from "node:path";

// Cuts a sample into batch files, `01.txt`, `02.txt`…, each holding whole units up to the judgements it is given. A unit's
// Line is never split across two, so the reader that is handed a batch judges every question the unit is judged for.
await runCommand(
  defineCommand({
    args: {
      sample: { description: "The file `ai:sweep:sample` printed its units to", required: true, type: "positional" },
      directory: { description: "The directory the batch files are written into", required: true, type: "positional" },
      judgements: {
        default: "20",
        description: "The judgements a batch holds at most, one per question a unit is judged for",
        type: "string",
      },
    },
    meta: {
      description: "Cut a sample into batch files a reader is handed, each holding whole units",
      name: "ai:sweep:batch",
    },
    run: ({ args }) => {
      const judgements = parseWholeCount(args.judgements, "judgements", 1);
      const batches = getBatches(
        readLedgerSample(resolveInvocationPath(args.sample)),
        (sample) => sample.ledgers.length,
        judgements,
      );
      const directory = resolveInvocationPath(args.directory);
      for (const [index, batch] of batches.entries()) {
        const path = join(directory, formatBatchFileName(index, batches.length, BATCH_FILE_EXTENSION));
        writeFileAtomically(path, batch.map((sample) => `${formatLedgerSample(sample)}\n`).join(""));
        console.info(path);
      }
    },
  }),
);
