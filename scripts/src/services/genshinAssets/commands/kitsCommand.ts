import type { SubCommandsDef } from "citty";

import { compareKits } from "#src/services/genshinAssets/kits/compareKits";
import { GCSIM_CACHE_DIRECTORY, GCSIM_TAG, WIKI_CACHE_DIRECTORY } from "#src/services/genshinAssets/kits/constants";
import { readKitInputs } from "#src/services/genshinAssets/kits/readKitInputs";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

export const kitsCommand: SubCommandsDef[string] = defineCommand({
  args: {
    compare: {
      description: "Build every kit module as it stands, seed each overlay with what its sources lack, and report",
      type: "boolean",
    },
    docs: { description: "Render each kit page's Provisional and Sources sections (phase 2)", type: "boolean" },
    gcsim: {
      default: GCSIM_CACHE_DIRECTORY,
      description: `A clone of gcsim at ${GCSIM_TAG}, cloned there if absent`,
      type: "string",
    },
    only: { description: "Comma-separated avatar ids to compare, every kit module's by default", type: "string" },
    "wiki-cache": {
      default: WIKI_CACHE_DIRECTORY,
      description: "Where the wiki's answers are kept, each fetched there if absent",
      type: "string",
    },
  },
  meta: { description: `Compare every kit module with gcsim ${GCSIM_TAG}, the wiki and the tables`, name: "kits" },
  run: async ({ args }) => {
    if (args.docs)
      throw new InvalidOperationError(Operation.Create, "kits --docs", "renders the kit pages from phase 2 on");
    else if (!args.compare)
      throw new InvalidOperationError(Operation.Create, "kits", "compares only, until its publication is built");
    const inputs = await readKitInputs({
      characterIds: args.only?.split(",").map(Number),
      gcsimDirectory: args.gcsim,
      wikiCacheDirectory: args["wiki-cache"],
    });
    for (const line of await compareKits(inputs)) console.log(line);
  },
});
