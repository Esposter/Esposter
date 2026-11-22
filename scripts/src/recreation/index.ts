import { GENSHIN_LUA_53 } from "#src/services/genshinAssets/lua/GENSHIN_LUA_53";
import { createRecreationCommand } from "#src/services/recreation/commands/createRecreationCommand";
import { runCommand } from "#src/services/timing/runCommand";

await runCommand(createRecreationCommand(GENSHIN_LUA_53));
