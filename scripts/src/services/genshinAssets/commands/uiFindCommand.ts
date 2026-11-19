import type { SubCommandsDef } from "citty";

import { matchesUiName } from "#src/services/genshinAssets/ui/matchesUiName";
import { readUiBlockIndex } from "#src/services/genshinAssets/ui/readUiBlockIndex";
import { readUiIndexEntries } from "#src/services/genshinAssets/ui/readUiIndexEntries";
import { readUiIndexPaths } from "#src/services/genshinAssets/ui/readUiIndexPaths";
import { resolveUiBlock } from "#src/services/genshinAssets/ui/resolveUiBlock";
import { toUiFindResult } from "#src/services/genshinAssets/ui/toUiFindResult";
import { parseWholeCount } from "#src/services/shared/parseWholeCount";
import { readMatchingEntries } from "#src/services/shared/readMatchingEntries";
import { defineCommand } from "citty";

export const uiFindCommand: SubCommandsDef[string] = defineCommand({
  args: {
    block: {
      description: "Only this block, such as 04949489 or 00/04949489.blk, indexed first if it is not yet",
      type: "string",
    },
    limit: { default: "20", description: "How many objects to print at most", type: "string" },
    pattern: {
      description:
        "A regular expression the object's name matches, as the export names it or with its suffix taken off",
      required: true,
      type: "positional",
    },
  },
  meta: {
    description:
      "Print the UI objects whose name matches, one JSON line each: its block, container, GameObject path ID, name, its ancestors' names, its layout and its components. Searches the blocks already indexed unless a block is named",
    name: "ui-find",
  },
  run: async ({ args }) => {
    const limit = parseWholeCount(args.limit, "limit", 1);
    const pattern = new RegExp(args.pattern, "u");
    const indexPaths = args.block
      ? [await readUiBlockIndex(await resolveUiBlock(args.block))]
      : await readUiIndexPaths();
    const entries = readMatchingEntries(
      indexPaths.map((indexPath) => readUiIndexEntries(indexPath)),
      (entry) => matchesUiName(entry.name, pattern),
      limit,
    );
    for await (const entry of entries) console.log(JSON.stringify(toUiFindResult(entry)));
  },
});
