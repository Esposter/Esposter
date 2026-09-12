import { REPOSITORY_ROOT } from "#src/services/constants";
import { getSweepFilePaths } from "#src/sweeps/getSweepFilePaths";
import { checkHasRepeatedListItems } from "#src/sweeps/repeatedListItems/checkHasRepeatedListItems";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Prints rather than exits non-zero: rows that differ in more than their data are written out on purpose, and a
// Shell whose three items are three different affordances is not a list (`.agents/ledgers/vue-components.md`).
for (const path of getSweepFilePaths("apps/web/app/components/*.vue"))
  if (checkHasRepeatedListItems(readFileSync(resolve(REPOSITORY_ROOT, path), "utf8"))) console.info(path);
