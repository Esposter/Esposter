import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildKitPublication } from "#src/services/genshinAssets/kits/buildKitPublication";
import { compareKits } from "#src/services/genshinAssets/kits/compareKits";
import { GCSIM_CACHE_DIRECTORY, GCSIM_TAG, WIKI_CACHE_DIRECTORY } from "#src/services/genshinAssets/kits/constants";
import { readKitInputs } from "#src/services/genshinAssets/kits/readKitInputs";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const kitsCommand: SubCommandsDef[string] = defineCommand({
  args: {
    ...dryRunArgs,
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
    only: {
      description: "Comma-separated avatar ids to compare, every kit module's by default; a publish takes every kit",
      type: "string",
    },
    "wiki-cache": {
      default: WIKI_CACHE_DIRECTORY,
      description: "Where the wiki's answers are kept, each fetched there if absent",
      type: "string",
    },
  },
  meta: {
    description: `Publish every kit's record and its sources from gcsim ${GCSIM_TAG}, the wiki and the tables`,
    name: "kits",
  },
  run: async ({ args }) => {
    if (args.docs)
      throw new InvalidOperationError(Operation.Create, "kits --docs", "renders the kit pages from phase 2 on");
    // The publish replaces the whole `kits` index, so a publish of some kits would drop every other kit's record
    else if (args.only !== undefined && !args.compare)
      throw new InvalidOperationError(
        Operation.Create,
        "kits --only",
        "narrows --compare, as a publish takes every kit",
      );
    const inputs = await readKitInputs({
      characterIds: args.only?.split(",").map(Number),
      gcsimDirectory: args.gcsim,
      wikiCacheDirectory: args["wiki-cache"],
    });
    if (args.compare) {
      for (const line of await compareKits(inputs)) console.log(line);
      return;
    }
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: buildKitPublication(inputs),
        scopes: [GameDataset.Kits, GameDataset.KitSources],
      }),
    );
  },
});
