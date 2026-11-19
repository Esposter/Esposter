import { readDuplicateProseFindings } from "#src/services/sweeps/duplicateProse/readDuplicateProseFindings";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// Prints rather than exits non-zero: the pass reads the list and decides which page owns each run and which
// Keeps a pointer (`.agents/ledgers/docs/README.md`); `src/workspace/duplicateProse.test.ts` is what fails on it.
await runCommand(
  defineCommand({
    meta: {
      description:
        "Print each run of prose that two pages of different owners share, with its word count and opening words",
      name: "ai:sweep:duplicate-prose",
    },
    run: () => {
      for (const { paths, words } of readDuplicateProseFindings())
        console.info(`${paths[0]} | ${paths[1]}: ${words.length} words — ${words.slice(0, 12).join(" ")} …`);
    },
  }),
);
