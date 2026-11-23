import { hostedAssetsCommand } from "#src/services/hostedAssets/commands/hostedAssetsCommand";
import { runCommand } from "#src/services/timing/runCommand";

await runCommand(hostedAssetsCommand);
