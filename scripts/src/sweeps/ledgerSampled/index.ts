import { LedgerEventType } from "#src/models/sweeps/ledgerCoverage/LedgerEventType";
import { ledgerFixerResultSchema } from "#src/models/sweeps/ledgerCoverage/LedgerFixerResult";
import { readJsonlRecords } from "#src/services/shared/readJsonlRecords";
import { resolveInvocationPath } from "#src/services/shared/resolveInvocationPath";
import {
  FIXER_RESULT_FILE_EXTENSION,
  SWEPT_CELL_SEPARATOR,
  TRAILER_VALUE_SEPARATOR,
} from "#src/services/sweeps/ledgerCoverage/constants";
import { getSampledCounts } from "#src/services/sweeps/ledgerCoverage/getSampledCounts";
import { readLedgerSample } from "#src/services/sweeps/ledgerCoverage/readLedgerSample";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// Prints each question's `Sampled:` trailer, read from the sample and from the fixers' result files, so the record commit
// That ends a sample carries the counts the sample's fixers produced
await runCommand(
  defineCommand({
    args: {
      sample: { description: "The file `ai:sweep:sample` printed its units to", required: true, type: "positional" },
      directory: {
        description: "The fixers' directory, whose result files are read",
        required: true,
        type: "positional",
      },
    },
    meta: {
      description:
        "Print each question's Sampled trailer: the cells its sample drew and the defects its fixers settled",
      name: "ai:sweep:sampled",
    },
    run: ({ args }) => {
      const results = readJsonlRecords(
        resolveInvocationPath(args.directory),
        FIXER_RESULT_FILE_EXTENSION,
        ledgerFixerResultSchema,
      ).map(({ record }) => record);
      const counts = getSampledCounts(readLedgerSample(resolveInvocationPath(args.sample)), results);
      for (const { defects, ledger, size } of counts)
        console.info(
          `${LedgerEventType.Sampled}: ${ledger}${TRAILER_VALUE_SEPARATOR}${size}${SWEPT_CELL_SEPARATOR}${defects}`,
        );
    },
  }),
);
