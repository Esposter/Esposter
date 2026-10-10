import { MILLISECONDS_PER_DAY } from "#src/services/usage/constants";
import { formatTranscriptRows } from "#src/services/usage/formatTranscriptRows";
import { formatUsageTotalRows } from "#src/services/usage/formatUsageTotalRows";
import { readUsageTally } from "#src/services/usage/readUsageTally";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand, runMain } from "citty";

// `pnpm ai:usage` — where Claude Code usage went over the last days, by bucket and family, then the heaviest transcripts
await runMain(
  defineCommand({
    args: {
      days: {
        default: "7",
        description: "Count only the transcript entries from the last this many days",
        type: "string",
      },
      project: {
        default: "",
        description: "Count only the projects whose folder name contains this; empty counts every project",
        type: "string",
      },
    },
    meta: {
      description: "Print where Claude Code usage went, by bucket and model family, and the heaviest transcripts",
      name: "usage",
    },
    run: ({ args }) => {
      const days = Number(args.days);
      if (!Number.isFinite(days) || days <= 0)
        throw new InvalidOperationError(Operation.Read, "usage", "--days is a positive number of days");
      const tally = readUsageTally(
        args.project,
        Temporal.Now.instant().epochMilliseconds - days * MILLISECONDS_PER_DAY,
      );
      for (const line of formatUsageTotalRows([...tally.totals.values()])) console.info(line);
      console.info("");
      for (const line of formatTranscriptRows([...tally.transcripts.values()])) console.info(line);
    },
  }),
);
