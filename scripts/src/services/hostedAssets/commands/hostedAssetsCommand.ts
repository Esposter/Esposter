import type { CommandDef } from "citty";

import { fillCommand } from "#src/services/hostedAssets/commands/fillCommand";
import { defineCommand } from "citty";

// The hosted assets tool: fills the local mirror of every product's lock, and checks and publishes what the locks name
export const hostedAssetsCommand: CommandDef = defineCommand({
  meta: { description: "Fill, check and publish the hosted assets every product declares", name: "hosted-assets" },
  subCommands: { fill: fillCommand },
});
