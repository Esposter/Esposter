import type { SubCommandsDef } from "citty";

import { SHORT_HASH_LENGTH } from "#src/services/genshinParity/reference/constants";
import { backfillPublicRecordings } from "#src/services/genshinParity/reference/backfillPublicRecordings";
import { formatMebibytes } from "#src/services/genshinParity/reference/formatMebibytes";
import { defineCommand } from "citty";

export const recordingsBackfillCommand: SubCommandsDef[string] = defineCommand({
  args: {
    "dry-run": {
      default: false,
      description: "Print the rows that would be added, and write nothing",
      type: "boolean",
    },
  },
  meta: {
    description:
      "Add a manifest row for each public recording in the captures folder that has none, named by its file; no bytes are uploaded, and a restore fetches it again by its id",
    name: "backfill",
  },
  run: async ({ args }) => {
    const isDryRun = args["dry-run"];
    const { added, alreadyHeld, differing, skipped } = await backfillPublicRecordings(isDryRun);
    for (const { bytes, name, sha256, source } of added)
      console.log(`${name}  ${source}  ${formatMebibytes(bytes)}  ${sha256.slice(0, SHORT_HASH_LENGTH)}`);
    for (const name of differing) console.log(`differs  ${name}: its file's hash is not its row's, so the row stands`);
    const skippedLine =
      skipped.length === 0 ? "" : `, skipped ${skipped.length} non-matching names: ${skipped.join(", ")}`;
    console.log(
      `${added.length} rows ${isDryRun ? "would be added" : "added"}, ${alreadyHeld} already present${skippedLine}`,
    );
  },
});
