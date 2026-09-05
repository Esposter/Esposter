import { getSweepFilePaths } from "#scripts/sweeps/getSweepFilePaths";
import { checkHasRepeatedListItems } from "#scripts/sweeps/repeatedListItems/checkHasRepeatedListItems";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..", "..");

// Prints rather than exits non-zero: rows that differ in more than their data are written out on purpose, and a
// Shell whose three items are three different affordances is not a list (`.agents/ledgers/vue-components.md`).
for (const path of getSweepFilePaths("packages/app/app/components/*.vue"))
  if (checkHasRepeatedListItems(readFileSync(resolve(root, path), "utf8"))) console.info(path);
