import type { SubCommandsDef } from "citty";

import { formatLuaDialectReport } from "#src/services/genshinAssets/scene/formatLuaDialectReport";
import { defineCommand } from "citty";

export const luaDialectCommand: SubCommandsDef[string] = defineCommand({
  args: {
    file: {
      description: "The exported scene script, its raw bytes beginning with the four-byte length word",
      required: true,
      type: "positional",
    },
  },
  meta: {
    description:
      "Report a scene script's opcode numbers by their operands, and the stock Lua 5.3 opcode each constraint gives them, without writing anything",
    name: "lua-dialect",
  },
  run: async ({ args }) => {
    console.log(await formatLuaDialectReport(args.file));
  },
});
