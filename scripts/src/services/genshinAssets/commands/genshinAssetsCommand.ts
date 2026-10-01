import type { CommandDef } from "citty";

import { arrangementCommand } from "#src/services/genshinAssets/commands/arrangementCommand";
import { behavioursCommand } from "#src/services/genshinAssets/commands/behavioursCommand";
import { clearanceCommand } from "#src/services/genshinAssets/commands/clearanceCommand";
import { clipsCommand } from "#src/services/genshinAssets/commands/clipsCommand";
import { extractCommand } from "#src/services/genshinAssets/commands/extractCommand";
import { fitCommand } from "#src/services/genshinAssets/commands/fitCommand";
import { interfaceCommand } from "#src/services/genshinAssets/commands/interfaceCommand";
import { inventoryCommand } from "#src/services/genshinAssets/commands/inventoryCommand";
import { mapCommand } from "#src/services/genshinAssets/commands/mapCommand";
import { shadersCommand } from "#src/services/genshinAssets/commands/shadersCommand";
import { treeCommand } from "#src/services/genshinAssets/commands/treeCommand";
import { witnessCommand } from "#src/services/genshinAssets/commands/witnessCommand";
import { defineCommand } from "citty";

// The derived assets' tool, one subcommand a step (apps/web/content/docs/genshin/derived-assets.md)
export const genshinAssetsCommand: CommandDef = defineCommand({
  meta: { description: "Map, export and fit the game's own assets as parameters of ours", name: "genshin:assets" },
  subCommands: {
    map: mapCommand,
    extract: extractCommand,
    tree: treeCommand,
    behaviours: behavioursCommand,
    arrangement: arrangementCommand,
    clearance: clearanceCommand,
    shaders: shadersCommand,
    inventory: inventoryCommand,
    interface: interfaceCommand,
    clips: clipsCommand,
    witness: witnessCommand,
    fit: fitCommand,
  },
});
