import type { ComponentReference } from "genshin-interface";

import { GameSourceKind } from "genshin-interface";

// Windrise's sources in the game's data and in public recordings, what every search over them found, and what is still
// Open. A ground tile is the game's own, 1024 metres on a side, its column the world's x over 1024 and its row its z
export const reference: ComponentReference = {
  findings: [
    {
      found:
        "The frame was drawn without the ground and veiled half in the sun's colour; neither was the scene's. The screen was ready before its ground streamed in, and three's god rays reached their most opacity over every ray of the valley",
      search:
        "The world screen shot on the parity page at 1920 by 1080 at ready, and its post chain bisected stage by stage",
    },
    {
      found:
        "Four fixed-camera recordings with no interface: the statue under the oak through a whole day on the 2026 build, the valley from the south through a whole day on a 2022 build, the oak before the mountain through a day on a 2021 build, and the oak beside Venti by day in 4K on the 2026 build. A painted live wallpaper among the results is not the game's",
      search:
        "YouTube for Windrise ambience, day and night cycles, time lapses and HUD-free footage, frames read at several seconds of each",
    },
    {
      found:
        "One real second is one game minute in both whole-day recordings: the statue's opens before dawn and sets its sun near its twelfth minute, the valley's opens near noon and sets near its seventh",
      search: "A frame a minute of each 24-minute recording laid out as a contact sheet",
    },
    {
      found:
        "The Statue of The Seven is gadget SceneObj_Resident_Goddess, Mondstadt's of the five; its meshes are Stages_MdGoddess01's by level. No prefab named for the gadget is in the asset map or the index",
      search:
        "GadgetExcelConfigData for the gadgets named Statue of The Seven, then the asset index and the raw asset map for its names",
    },
    {
      found:
        "Windrise's statue is the overworld's scene point 4: of the six statues the points place in Mondstadt, the one whose area is 201, which WorldAreaConfigData names Windrise under Galesong Hill",
      search:
        "scene3_point.json for every point naming gadget 70110001, each point's area resolved through the area table and TextMap_MediumEN",
    },
    {
      found:
        "The oak is Stages_Unique_CyTree01, the one unique tree of the open world's Stages set: a prefab per level of detail, Lod1 to Lod3, each a bark and a leaf child; Lod0's meshes are in the same block with no prefab of their own. WindriseLeaf is the falling-leaf prop",
      search:
        "The asset index for Windrise, the pinyin names, Md and unique trees, then the GameObjects and Transforms of the meshes' blocks",
    },
    {
      found:
        "Mondstadt's ground is BigWorldTerrain tiles of 1024 metres: their base maps laid out by name show Dragonspine's snow under its statue, Starfell's statue to its north and Galesong's to the east, with Windrise's between Dragonspine and Cider Lake in tile 1,-2 near its east edge. The ErosionHeightmap tiles and the far fog's height tiles cover other regions only",
      search:
        "Every BigWorldTerrain base map exported and laid out by its tile's name, with the six statues' points marked under columns of x over 1024 and rows of z over 1024",
    },
    {
      found:
        "The tile's base map, splat alphas, tint, mask and specular textures and its CTS profile are named; its heights are not, under any name with height, terrain or the tile in it. The blocks' MiHoYoBinData blobs are length-prefixed records of floats, unit scales among them: placements, not a heightfield",
      search:
        "The asset index for every asset naming the tile, then the raw blobs of the tile's two texture blocks by size and header",
    },
    {
      found:
        "BigWorld_1_-2, a SectorBinData script, holds about fourteen hundred positions packed twelve bytes apart, every one inside the tile, those round the statue within two metres of its height: points on the ground about one every 27 metres, exact data a fitted ground can be held to. BigWorld_1_-2_Index, its sibling, holds no position in the tile's range",
      search:
        "The asset index for MonoBehaviours naming the tile, then each one's raw bytes scanned at every offset for three floats inside the tile's x and z and a height of the region's",
    },
  ],
  open: [
    "The ground's dense heights: the binary the tile's name ends in, and how its samples are laid out; until then our generator is fitted to the sector's ground points",
    "Where the oak and the rest of Windrise stand: the streaming layers' placement records decoded, or their own scene's roots found",
    "Each recording's camera, solved once the witness draws the statue, the oak and the ground, and then the parity references at the hours each recording shows",
    "Mondstadt's sky by hour, from its Enviro profile's raw bytes as the login's was read",
  ],
  sources: {
    groundMaterial: {
      block: "00/02094476.blk",
      kind: GameSourceKind.Material,
      name: "BigWorld_<tile>_Model_LOD0",
      role: "A terrain tile's material: three splat layers, each an albedo and a normal tiled eight times, a splat map and a tint map",
    },
    groundPoints: {
      block: "00/11755697.blk",
      kind: GameSourceKind.MonoBehaviour,
      name: "BigWorld_1_-2",
      role: "Points on Windrise's ground, sparse and exact, which the ground's fit is held to",
    },
    groundProfile: {
      block: "00/11274841.blk",
      kind: GameSourceKind.MonoBehaviour,
      name: "CTS_Profile_BigWorldTerrain_1_-2.bin",
      role: "The CTS terrain shader's settings for Windrise's tile",
    },
    groundTile: {
      block: "00/12309586.blk",
      kind: GameSourceKind.Texture,
      name: "BigWorldTerrain_1_-2.bin_BaseMap",
      role: "Windrise's ground from above, the tile its statue stands in, beside its splat, tint and mask textures in 00/09721590.blk",
    },
    oak: {
      block: "00/16170614.blk",
      kind: GameSourceKind.GameObject,
      name: "Stages_Unique_CyTree01_Lod1",
      pathId: "6733514611168788700",
      role: "The oak's prefab nearest the camera with one, its bark and leaves as children; Lod0's meshes are beside it",
    },
    oakMaterials: {
      block: "00/00495653.blk",
      kind: GameSourceKind.Material,
      name: "Stages_Unique_CyTree01_Bark01, Stages_Unique_CyTree01_Bark02",
      role: "The oak's bark, in the block holding the statue's material too",
    },
    oakRecording: {
      block: "yt-2IPBviDPFB8.mp4, the hour from 25 minutes in",
      kind: GameSourceKind.Capture,
      name: "[4K] Windrise, Mondstadt Ambience, a 2026 PC recording from a fixed camera with Venti in its lower left",
      role: "The oak by day at 2160 high on the current build",
    },
    oakTimelapse: {
      block: "yt-qJHuDThRieE.mp4",
      kind: GameSourceKind.Capture,
      name: "Windrise, Genshin Impact 24 hour time lapse, a 2021 recording",
      role: "The oak before the mountain through a day, on an older build",
    },
    statue: {
      block: "00/09847208.blk",
      kind: GameSourceKind.Mesh,
      name: "Stages_MdGoddess01_Base_Lod0, Stages_MdGoddess01_Level1_Lod0 and the further levels' meshes",
      role: "The Statue of The Seven's meshes by level, its material Stages_MdGoddess01 in 00/00495653.blk",
    },
    statueGadget: {
      block: "ExcelBinOutput/GadgetExcelConfigData.json",
      kind: GameSourceKind.DataTable,
      name: "70110001 SceneObj_Resident_Goddess",
      role: "The statue as a gadget, which the scene points name",
    },
    statuePoint: {
      block: "BinOutput/Scene/Point/scene3_point.json",
      kind: GameSourceKind.DataTable,
      name: "Point 4",
      role: "Where Windrise's statue stands and how it turns, and where its teleport sets the traveller down",
    },
    statueTimelapse: {
      block: "yt-zPDi6WBJW9Y.mp4",
      kind: GameSourceKind.Capture,
      name: "Windrise Ambience, a 2026 PC recording from a fixed camera through a whole day",
      role: "The statue under the oak at every hour on the current build, a game minute a second",
    },
    valleyTimelapse: {
      block: "yt-w-63Sw6IP2w.mp4",
      kind: GameSourceKind.Capture,
      name: "Windswept Wilderness (Windrise) Timelapse Ambience, a 2022 recording",
      role: "The valley from the south through a whole day, a game minute a second, on an older build",
    },
  },
};
