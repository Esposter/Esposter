import type { LuaDialect } from "#src/models/recreation/lua/LuaDialect";
import type { CommandDef } from "citty";

import { clipCommand } from "#src/services/recreation/commands/clipCommand";
import { createLuaDialectCommand } from "#src/services/recreation/commands/luaDialectCommand";
import { searchCommand } from "#src/services/recreation/commands/searchCommand";
import { defineCommand } from "citty";

// The game-free tools a recreation of any reference uses, one subcommand a step. The Lua dialect `lua-dialect` reads a
// Script in is passed in by the entry that names the game, so this tree holds no game's table
export const createRecreationCommand = (luaDialect: LuaDialect): CommandDef =>
  defineCommand({
    meta: { description: "The tools a recreation of any reference uses, whatever it recreates", name: "recreation" },
    subCommands: { clip: clipCommand, "lua-dialect": createLuaDialectCommand(luaDialect), search: searchCommand },
  });
