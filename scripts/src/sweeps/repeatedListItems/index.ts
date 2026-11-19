import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { checkHasRepeatedListItems } from "#src/services/sweeps/repeatedListItems/checkHasRepeatedListItems";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Prints rather than exits non-zero: rows that differ in more than their data are written out on purpose, and a
// Shell whose three items are three different affordances is not a list (`.agents/ledgers/vue-components.md`).
await runCommand(
  defineCommand({
    meta: {
      description: "Print each component whose rows are written out one by one where a v-for belongs",
      name: "ai:sweep:repeated-list-items",
    },
    run: () => {
      for (const path of readSweepFilePaths("apps/web/app/components/*.vue"))
        if (checkHasRepeatedListItems(readFileSync(resolve(REPOSITORY_ROOT, path), "utf8"))) console.info(path);
    },
  }),
);
