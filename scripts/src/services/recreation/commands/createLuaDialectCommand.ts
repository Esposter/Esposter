import type { LuaDialect } from "#src/models/recreation/lua/LuaDialect";
import type { SubCommandsDef } from "citty";

import { formatLuaDialectReport } from "#src/services/recreation/lua/formatLuaDialectReport";
import { defineCommand } from "citty";

// The report reads the scene script in the dialect the caller passes, since the tool holds no game's header layout
export const createLuaDialectCommand = (dialect: LuaDialect): SubCommandsDef[string] =>
  defineCommand({
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
      console.log(await formatLuaDialectReport(args.file, dialect));
    },
  });
