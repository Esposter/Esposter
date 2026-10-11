import type { SubCommandsDef } from "citty";

import { LuaDialectName } from "#src/models/lua/LuaDialectName";
import { countSceneScriptElements } from "#src/services/genshinAssets/scene/countSceneScriptElements";
import { exportSceneScript } from "#src/services/genshinAssets/scene/exportSceneScript";
import { formatSceneScriptShape } from "#src/services/genshinAssets/scene/formatSceneScriptShape";
import { readLuaDialect } from "#src/services/lua/readLuaDialect";
import { defineCommand } from "citty";

export const sceneScriptsCommand: SubCommandsDef[string] = defineCommand({
  args: {
    file: {
      description: "The exported scene script, its raw bytes beginning with the four-byte length word",
      required: true,
      type: "positional",
    },
    dialect: {
      default: LuaDialectName.Genshin,
      description: `The dialect the script is written in: ${Object.values(LuaDialectName).join(", ")}`,
      options: Object.values(LuaDialectName),
      type: "enum",
    },
  },
  meta: {
    description:
      "Read a scene script of Lua 5.3 bytecode as data, write the globals it sets as JSON beside it, and print each top-level global's element count and entry shape",
    name: "scene-scripts",
  },
  run: async ({ args }) => {
    const globals = await exportSceneScript(args.file, readLuaDialect(args.dialect));
    for (const [name, value] of Object.entries(globals))
      console.log(`${name}: ${countSceneScriptElements(value)} ${formatSceneScriptShape(value)}`);
  },
});
