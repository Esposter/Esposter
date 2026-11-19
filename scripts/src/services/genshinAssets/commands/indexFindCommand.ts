import type { SubCommandsDef } from "citty";

import { GENSHIN_ANIMESTUDIO_OPTIONS } from "#src/services/genshinAssets/shared/constants";
import { readAssetsMatching } from "#src/services/genshinAssets/shared/readAssetsMatching";
import { defineCommand } from "citty";

export const indexFindCommand: SubCommandsDef[string] = defineCommand({
  args: {
    pattern: {
      description: "A regular expression the asset's name matches, as the asset index holds it",
      required: true,
      type: "positional",
    },
  },
  meta: {
    description:
      "Print the asset index's rows whose name matches, one JSON line each: its name, type, block and path ID. Each row is one asset, not a GameObject",
    name: "find",
  },
  run: async ({ args }) => {
    const pattern = new RegExp(args.pattern, "u");
    for (const { block, name, pathId, type } of await readAssetsMatching(pattern, GENSHIN_ANIMESTUDIO_OPTIONS))
      console.log(JSON.stringify({ block, name, pathId, type }));
  },
});
