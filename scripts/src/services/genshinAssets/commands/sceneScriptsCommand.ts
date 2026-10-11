import type { SubCommandsDef } from "citty";

import { countSceneScriptElements } from "#src/services/genshinAssets/scene/countSceneScriptElements";
import { exportSceneScript } from "#src/services/genshinAssets/scene/exportSceneScript";
import { defineCommand } from "citty";

export const sceneScriptsCommand: SubCommandsDef[string] = defineCommand({
  args: {
    file: {
      description: "The exported scene script, its raw bytes beginning with the four-byte length word",
      required: true,
      type: "positional",
    },
  },
  meta: {
    description:
      "Read a scene script of Lua 5.3 bytecode as data, write the globals it sets as JSON beside it, and print each top-level global with its element count",
    name: "scene-scripts",
  },
  run: async ({ args }) => {
    for (const [name, value] of Object.entries(await exportSceneScript(args.file)))
      console.log(`${name}: ${countSceneScriptElements(value)}`);
  },
});
