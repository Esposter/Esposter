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
      description: "Build every kit's published record, seed each overlay with what its sources lack, and report",
      type: "boolean",
    },
    docs: { description: "Render each kit page's Provisional and Sources sections (phase 2)", type: "boolean" },
    gcsim: {
      default: GCSIM_CACHE_DIRECTORY,
      description: `A clone of gcsim at ${GCSIM_TAG}, cloned there if absent`,
      type: "string",
    },
    only: {
      description:
        "Comma-separated avatar ids: the kits --compare reads, every published kit's by default, or the kits a publish may change or add",
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
    const characterIds = args.only?.split(",").map(Number);
    if (args.compare) {
      const inputs = await readKitInputs({
        characterIds,
        gcsimDirectory: args.gcsim,
        wikiCacheDirectory: args["wiki-cache"],
      });
      for (const line of await compareKits(inputs)) console.log(line);
      return;
    }
    // The publish replaces the whole `kits` index, so it builds every published kit and the named ones, a named kit yet to
    // Be published among them, and only the named ones may change
    const inputs = await readKitInputs({
      characterIds,
      gcsimDirectory: args.gcsim,
      isEveryPublishedKitRead: true,
      wikiCacheDirectory: args["wiki-cache"],
    });
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: buildKitPublication(inputs, characterIds),
        scopes: [GameDataset.Kits, GameDataset.KitSources],
      }),
    );
  },
});
