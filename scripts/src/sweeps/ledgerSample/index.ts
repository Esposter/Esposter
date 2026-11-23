import { SAMPLE_SIZE } from "#src/services/sweeps/ledgerCoverage/constants";
import { formatLedgerSample } from "#src/services/sweeps/ledgerCoverage/formatLedgerSample";
import { getLedgerSample } from "#src/services/sweeps/ledgerCoverage/getLedgerSample";
import { getTouchedLedgerSample } from "#src/services/sweeps/ledgerCoverage/getTouchedLedgerSample";
import { readLedgerEvents } from "#src/services/sweeps/ledgerCoverage/readLedgerEvents";
import { readLedgerStatus } from "#src/services/sweeps/ledgerCoverage/readLedgerStatus";
import { readPartitionUnits } from "#src/services/sweeps/ledgerCoverage/readPartitionUnits";
import { readRangeChangedPaths } from "#src/services/sweeps/ledgerCoverage/readRangeChangedPaths";
import { readTrackedQuestionUnits } from "#src/services/sweeps/ledgerCoverage/readTrackedQuestionUnits";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// The next sample of the questions, read from the status: every question's open cells, drawn rarest question first.
// Each unit is printed with the questions it is judged for. A seed fixes the draw, so a rerun on the same day reads the
// Same units. With `--touched` the draw is instead every open Cell a revision range reached, the cells other sessions'
// Commits touched after a sync, and the seed is not read.
await runCommand(
  defineCommand({
    args: {
      seed: {
        default: Temporal.Now.plainDateISO().toString(),
        description: "The seed the draw is ordered by, the day's date by default",
        required: false,
        type: "positional",
      },
      touched: {
        description:
          "Draw every open cell whose unit holds a file the revision range changes, e.g. `<base>..<end>`, in place of the seeded sample",
        required: false,
        type: "string",
      },
    },
    meta: {
      description:
        "Print the units the next sample reads, each with the questions it is judged for, or the open cells a revision range touched",
      name: "ai:sweep:sample",
    },
    run: ({ args }) => {
      const ledgerCoverages = readLedgerStatus(readLedgerEvents(), readTrackedQuestionUnits());
      const ledgerSamples =
        args.touched === undefined
          ? getLedgerSample(ledgerCoverages, args.seed, SAMPLE_SIZE)
          : getTouchedLedgerSample(ledgerCoverages, readPartitionUnits(), readRangeChangedPaths(args.touched));
      for (const ledgerSample of ledgerSamples) console.info(formatLedgerSample(ledgerSample));
    },
  }),
);
