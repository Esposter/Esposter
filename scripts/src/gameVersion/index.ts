import { gameVersionCommand } from "#src/services/gameVersion/commands/gameVersionCommand";
import { runCommand } from "#src/services/timing/runCommand";

await runCommand(gameVersionCommand);
