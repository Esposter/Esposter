import { GENSHIN_LUA_53 } from "#src/services/genshinAssets/lua/GENSHIN_LUA_53";
import { createRecreationCommand } from "#src/services/recreation/commands/recreationCommand";
import { runMain } from "citty";

await runMain(createRecreationCommand(GENSHIN_LUA_53));
