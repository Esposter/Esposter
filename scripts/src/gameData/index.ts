import { gameDataCommand } from "#src/services/gameData/commands/gameDataCommand";
import { runCommand } from "#src/services/timing/runCommand";

await runCommand(gameDataCommand);
