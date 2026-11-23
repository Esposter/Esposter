import type { CommandDef } from "citty";

import { fillCommand } from "#src/services/hostedAssets/commands/fillCommand";
import { publishCommand } from "#src/services/hostedAssets/commands/publishCommand";
import { pullCommand } from "#src/services/hostedAssets/commands/pullCommand";
import { verifyCommand } from "#src/services/hostedAssets/commands/verifyCommand";
import { defineCommand } from "citty";

// The hosted assets tool: fills the local mirror of every product's lock, and publishes and pulls a files product's folder
export const hostedAssetsCommand: CommandDef = defineCommand({
  meta: { description: "Fill, check and publish the hosted assets every product declares", name: "hosted-assets" },
  subCommands: { fill: fillCommand, publish: publishCommand, pull: pullCommand, verify: verifyCommand },
});
