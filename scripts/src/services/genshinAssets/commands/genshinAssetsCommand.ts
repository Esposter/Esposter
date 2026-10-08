import type { CommandDef } from "citty";

import { behavioursCommand } from "#src/services/genshinAssets/commands/behavioursCommand";
import { clearanceCommand } from "#src/services/genshinAssets/commands/clearanceCommand";
import { clipsCommand } from "#src/services/genshinAssets/commands/clipsCommand";
import { enemiesCommand } from "#src/services/genshinAssets/commands/enemiesCommand";
import { extractCommand } from "#src/services/genshinAssets/commands/extractCommand";
import { fitCommand } from "#src/services/genshinAssets/commands/fitCommand";
import { interfaceCommand } from "#src/services/genshinAssets/commands/interfaceCommand";
import { inventoryCommand } from "#src/services/genshinAssets/commands/inventoryCommand";
import { mapCommand } from "#src/services/genshinAssets/commands/mapCommand";
import { musicCommand } from "#src/services/genshinAssets/commands/musicCommand";
import { playlistCommand } from "#src/services/genshinAssets/commands/playlistCommand";
import { shadersCommand } from "#src/services/genshinAssets/commands/shadersCommand";
import { soundsCommand } from "#src/services/genshinAssets/commands/soundsCommand";
import { statsCommand } from "#src/services/genshinAssets/commands/statsCommand";
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
    clearance: clearanceCommand,
    shaders: shadersCommand,
    inventory: inventoryCommand,
    interface: interfaceCommand,
    clips: clipsCommand,
    witness: witnessCommand,
    music: musicCommand,
    sounds: soundsCommand,
    playlist: playlistCommand,
    fit: fitCommand,
    stats: statsCommand,
    enemies: enemiesCommand,
  },
});
