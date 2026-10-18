import type { CommandDef } from "citty";

import { achievementsCommand } from "#src/services/genshinAssets/commands/achievementsCommand";
import { archiveCommand } from "#src/services/genshinAssets/commands/archiveCommand";
import { assetIndexCommand } from "#src/services/genshinAssets/commands/assetIndexCommand";
import { avatarCommand } from "#src/services/genshinAssets/commands/avatarCommand";
import { behavioursCommand } from "#src/services/genshinAssets/commands/behavioursCommand";
import { cameraCommand } from "#src/services/genshinAssets/commands/cameraCommand";
import { chestsCommand } from "#src/services/genshinAssets/commands/chestsCommand";
import { cityAreasCommand } from "#src/services/genshinAssets/commands/cityAreasCommand";
import { clearanceCommand } from "#src/services/genshinAssets/commands/clearanceCommand";
import { clipsCommand } from "#src/services/genshinAssets/commands/clipsCommand";
import { commissionsCommand } from "#src/services/genshinAssets/commands/commissionsCommand";
import { cookingCommand } from "#src/services/genshinAssets/commands/cookingCommand";
import { craftingCommand } from "#src/services/genshinAssets/commands/craftingCommand";
import { domainsCommand } from "#src/services/genshinAssets/commands/domainsCommand";
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
import { kitsCommand } from "#src/services/genshinAssets/commands/kitsCommand";
import { leyLineCommand } from "#src/services/genshinAssets/commands/leyLineCommand";
import { locomotionCommand } from "#src/services/genshinAssets/commands/locomotionCommand";
import { mapCommand } from "#src/services/genshinAssets/commands/mapCommand";
import { musicCommand } from "#src/services/genshinAssets/commands/musicCommand";
import { namecardsCommand } from "#src/services/genshinAssets/commands/namecardsCommand";
import { oculiCommand } from "#src/services/genshinAssets/commands/oculiCommand";
import { offeringsCommand } from "#src/services/genshinAssets/commands/offeringsCommand";
import { paletteCommand } from "#src/services/genshinAssets/commands/paletteCommand";
import { playlistCommand } from "#src/services/genshinAssets/commands/playlistCommand";
import { pointsCommand } from "#src/services/genshinAssets/commands/pointsCommand";
import { pointsFitCommand } from "#src/services/genshinAssets/commands/pointsFitCommand";
import { profileCommand } from "#src/services/genshinAssets/commands/profileCommand";
import { puzzlesCommand } from "#src/services/genshinAssets/commands/puzzlesCommand";
import { rankCommand } from "#src/services/genshinAssets/commands/rankCommand";
import { reputationCommand } from "#src/services/genshinAssets/commands/reputationCommand";
import { residentsCommand } from "#src/services/genshinAssets/commands/residentsCommand";
import { sceneGroupsCommand } from "#src/services/genshinAssets/commands/sceneGroupsCommand";
import { sceneNpcBornCommand } from "#src/services/genshinAssets/commands/sceneNpcBornCommand";
import { sceneScriptsCommand } from "#src/services/genshinAssets/commands/sceneScriptsCommand";
import { shadersCommand } from "#src/services/genshinAssets/commands/shadersCommand";
import { shopsCommand } from "#src/services/genshinAssets/commands/shopsCommand";
import { skillGlyphsCommand } from "#src/services/genshinAssets/commands/skillGlyphsCommand";
import { soundsCommand } from "#src/services/genshinAssets/commands/soundsCommand";
import { spiralAbyssCommand } from "#src/services/genshinAssets/commands/spiralAbyssCommand";
import { statsCommand } from "#src/services/genshinAssets/commands/statsCommand";
import { statuesCommand } from "#src/services/genshinAssets/commands/statuesCommand";
import { timingsCommand } from "#src/services/genshinAssets/commands/timingsCommand";
import { transPointsCommand } from "#src/services/genshinAssets/commands/transPointsCommand";
import { treeCommand } from "#src/services/genshinAssets/commands/treeCommand";
import { waypointsCommand } from "#src/services/genshinAssets/commands/waypointsCommand";
import { wildlifeCommand } from "#src/services/genshinAssets/commands/wildlifeCommand";
import { witnessCommand } from "#src/services/genshinAssets/commands/witnessCommand";
import { defineCommand } from "citty";

// The derived assets' tool, one subcommand a step (openspec/specs/genshin/derived-assets/design.md)
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
    camera: cameraCommand,
    timings: timingsCommand,
    avatar: avatarCommand,
    witness: witnessCommand,
    "city-areas": cityAreasCommand,
    "asset-index": assetIndexCommand,
    music: musicCommand,
    sounds: soundsCommand,
    playlist: playlistCommand,
    namecards: namecardsCommand,
    points: pointsCommand,
    "points-fit": pointsFitCommand,
    profile: profileCommand,
    fit: fitCommand,
    fishing: fishingCommand,
    rank: rankCommand,
    statues: statuesCommand,
    "trans-points": transPointsCommand,
    offerings: offeringsCommand,
    palette: paletteCommand,
    friendship: friendshipCommand,
    stats: statsCommand,
    "skill-glyphs": skillGlyphsCommand,
    kits: kitsCommand,
    enemies: enemiesCommand,
    items: itemsCommand,
    outcrops: leyLineCommand,
    chests: chestsCommand,
    residents: residentsCommand,
    "scene-groups": sceneGroupsCommand,
    "scene-npc-born": sceneNpcBornCommand,
    "scene-scripts": sceneScriptsCommand,
    oculi: oculiCommand,
    crafting: craftingCommand,
    cooking: cookingCommand,
    forging: forgingCommand,
    domains: domainsCommand,
    waypoints: waypointsCommand,
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
