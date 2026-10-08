import type { CommandDef } from "citty";

import { achievementsCommand } from "#src/services/genshinAssets/commands/achievementsCommand";
import { archiveCommand } from "#src/services/genshinAssets/commands/archiveCommand";
import { behavioursCommand } from "#src/services/genshinAssets/commands/behavioursCommand";
import { chestsCommand } from "#src/services/genshinAssets/commands/chestsCommand";
import { clearanceCommand } from "#src/services/genshinAssets/commands/clearanceCommand";
import { clipsCommand } from "#src/services/genshinAssets/commands/clipsCommand";
import { commissionsCommand } from "#src/services/genshinAssets/commands/commissionsCommand";
import { cookingCommand } from "#src/services/genshinAssets/commands/cookingCommand";
import { craftingCommand } from "#src/services/genshinAssets/commands/craftingCommand";
import { enemiesCommand } from "#src/services/genshinAssets/commands/enemiesCommand";
import { expeditionsCommand } from "#src/services/genshinAssets/commands/expeditionsCommand";
import { explorationCommand } from "#src/services/genshinAssets/commands/explorationCommand";
import { extractCommand } from "#src/services/genshinAssets/commands/extractCommand";
import { fishingCommand } from "#src/services/genshinAssets/commands/fishingCommand";
import { fitCommand } from "#src/services/genshinAssets/commands/fitCommand";
import { forgingCommand } from "#src/services/genshinAssets/commands/forgingCommand";
import { friendshipCommand } from "#src/services/genshinAssets/commands/friendshipCommand";
import { gadgetsCommand } from "#src/services/genshinAssets/commands/gadgetsCommand";
import { gatheringCommand } from "#src/services/genshinAssets/commands/gatheringCommand";
import { gcgCommand } from "#src/services/genshinAssets/commands/gcgCommand";
import { homeCommand } from "#src/services/genshinAssets/commands/homeCommand";
import { imaginariumCommand } from "#src/services/genshinAssets/commands/imaginariumCommand";
import { interfaceCommand } from "#src/services/genshinAssets/commands/interfaceCommand";
import { inventoryCommand } from "#src/services/genshinAssets/commands/inventoryCommand";
import { itemsCommand } from "#src/services/genshinAssets/commands/itemsCommand";
import { leyLineCommand } from "#src/services/genshinAssets/commands/leyLineCommand";
import { locomotionCommand } from "#src/services/genshinAssets/commands/locomotionCommand";
import { mapCommand } from "#src/services/genshinAssets/commands/mapCommand";
import { musicCommand } from "#src/services/genshinAssets/commands/musicCommand";
import { offeringsCommand } from "#src/services/genshinAssets/commands/offeringsCommand";
import { playlistCommand } from "#src/services/genshinAssets/commands/playlistCommand";
import { pointsCommand } from "#src/services/genshinAssets/commands/pointsCommand";
import { pointsFitCommand } from "#src/services/genshinAssets/commands/pointsFitCommand";
import { puzzlesCommand } from "#src/services/genshinAssets/commands/puzzlesCommand";
import { rankCommand } from "#src/services/genshinAssets/commands/rankCommand";
import { reputationCommand } from "#src/services/genshinAssets/commands/reputationCommand";
import { shadersCommand } from "#src/services/genshinAssets/commands/shadersCommand";
import { shopsCommand } from "#src/services/genshinAssets/commands/shopsCommand";
import { soundsCommand } from "#src/services/genshinAssets/commands/soundsCommand";
import { spiralAbyssCommand } from "#src/services/genshinAssets/commands/spiralAbyssCommand";
import { statsCommand } from "#src/services/genshinAssets/commands/statsCommand";
import { statuesCommand } from "#src/services/genshinAssets/commands/statuesCommand";
import { timingsCommand } from "#src/services/genshinAssets/commands/timingsCommand";
import { treeCommand } from "#src/services/genshinAssets/commands/treeCommand";
import { wildlifeCommand } from "#src/services/genshinAssets/commands/wildlifeCommand";
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
    locomotion: locomotionCommand,
    timings: timingsCommand,
    witness: witnessCommand,
    music: musicCommand,
    sounds: soundsCommand,
    playlist: playlistCommand,
    points: pointsCommand,
    "points-fit": pointsFitCommand,
    fit: fitCommand,
    fishing: fishingCommand,
    rank: rankCommand,
    statues: statuesCommand,
    offerings: offeringsCommand,
    friendship: friendshipCommand,
    stats: statsCommand,
    enemies: enemiesCommand,
    items: itemsCommand,
    outcrops: leyLineCommand,
    chests: chestsCommand,
    crafting: craftingCommand,
    cooking: cookingCommand,
    forging: forgingCommand,
    home: homeCommand,
    achievements: achievementsCommand,
    archive: archiveCommand,
    exploration: explorationCommand,
    puzzles: puzzlesCommand,
    gathering: gatheringCommand,
    gcg: gcgCommand,
    gadgets: gadgetsCommand,
    shops: shopsCommand,
    wildlife: wildlifeCommand,
    reputation: reputationCommand,
    expeditions: expeditionsCommand,
    commissions: commissionsCommand,
    "spiral-abyss": spiralAbyssCommand,
    imaginarium: imaginariumCommand,
  },
});
