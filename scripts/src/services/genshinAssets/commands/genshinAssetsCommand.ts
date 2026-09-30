import type { CommandDef } from "citty";

import { extractCommand } from "#src/services/genshinAssets/commands/extractCommand";
import { fitCommand } from "#src/services/genshinAssets/commands/fitCommand";
import { mapCommand } from "#src/services/genshinAssets/commands/mapCommand";
import { defineCommand } from "citty";

// The derived assets' tool, one subcommand a step (apps/web/content/docs/genshin/derived-assets.md)
export const genshinAssetsCommand: CommandDef = defineCommand({
  meta: { description: "Map, export and fit the game's own assets as parameters of ours", name: "genshin:assets" },
  subCommands: { map: mapCommand, extract: extractCommand, fit: fitCommand },
});
