import type { SubCommandsDef } from "citty";

import { readPrefabRoots } from "#src/services/genshinAssets/shared/readPrefabRoots";
import { defineCommand } from "citty";

export const rootFindCommand: SubCommandsDef[string] = defineCommand({
  args: {
    name: {
      description:
        "The GameObject's name, exactly as its block's layout dump holds it, such as SceneObj_Chest_NormalChest",
      required: true,
      type: "positional",
    },
  },
  meta: {
    description:
      "Print the block and path ID of each prefab root holding a GameObject of the name, one JSON line each, read from the props' layout dumps. Refuses a name no layout holds",
    name: "root-find",
  },
  run: async ({ args }) => {
    for (const { block, pathId } of await readPrefabRoots(args.name)) console.log(JSON.stringify({ block, pathId }));
  },
});
