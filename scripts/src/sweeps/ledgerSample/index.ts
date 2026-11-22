import { SAMPLE_SIZE } from "#src/services/sweeps/ledgerCoverage/constants";
import { getLedgerSample } from "#src/services/sweeps/ledgerCoverage/getLedgerSample";
import { readLedgerEvents } from "#src/services/sweeps/ledgerCoverage/readLedgerEvents";
import { readLedgerStatus } from "#src/services/sweeps/ledgerCoverage/readLedgerStatus";
import { readQuestionUnits } from "#src/services/sweeps/ledgerCoverage/readQuestionUnits";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// The next sample of the questions, read from the status: every question's open cells, drawn rarest question first,
// Each unit printed with the questions it is judged for. A seed fixes the draw, so a rerun on the same day reads the
// Same units.
await runCommand(
  defineCommand({
    args: {
      seed: {
        default: Temporal.Now.plainDateISO().toString(),
        description: "The seed the draw is ordered by, the day's date by default",
        required: false,
        type: "positional",
      },
    },
    meta: {
      description: "Print the units the next sample reads, each with the questions it is judged for",
      name: "ai:sweep:sample",
    },
    run: ({ args }) => {
      const statuses = readLedgerStatus(readLedgerEvents(), readQuestionUnits());
      for (const { ledgers, unit } of getLedgerSample(statuses, args.seed, SAMPLE_SIZE))
        console.info(`${unit} :: ${ledgers.join(", ")}`);
    },
  }),
);
