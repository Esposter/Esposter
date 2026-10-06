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
        "The tile's base map, splat alphas, tint, mask and specular textures and its CTS profile are named in the asset index; its heights are not, since the index holds no TerrainData. The texture blocks' MiHoYoBinData blobs are another area's placements, not a heightfield",
      search:
        "The asset index for every asset naming the tile, then the raw blobs of the tile's two texture blocks by size and header",
    },
    {
      found:
        "The tile's BSM text assets are not heights: a header of four grids, 64 cells a side down to 8, each cell a run of four-byte items, but a cell's values follow none of the sector's ground points under it, and the Firmament's scene carries the same format",
      search:
        "BigWorld_1_-2_BSM_* exported raw, the grids' cell tables read, and each 16-metre cell's median value correlated with the ground points in it under every cell order",
    },
    {
      found:
        "The game's own asset index of version 2.6, as the community publishes it, names every streamed asset of the open world by path: per tile a StreamGen blob and its index, per-layer chunks, HLODs, water and fog tiles, reflection probes and its terrain as TerrainData_Final/…/BigWorldTerrain_1_-2.bin. AnimeStudio names a MiHoYoBinData by its path's PathHashLast in hex, so a blob is found by its path",
      search:
        "AnimeStudio's --ai_file option traced to radioegor146/gi-asset-indexes, its last full index fetched and its paths under Build/LevelStreaming listed for the tile",
    },
    {
      found:
        "A StreamGen blob is a length word and chunks at its index's offsets; a chunk is a varint mask, an id, a count and that many records, and a record a varint mask whose bits, in order, carry flags, its prefab's 64-bit path hash, the world's 32-bit id for the prefab, a streaming radius, its position, its Euler rotation in degrees, its scale (each vector led by a byte of which components follow), an instance, a parent and a flag. Every chunk but the tile's last two parses to its next one's offset, about sixteen thousand placements",
      search:
        "Records near the statue read by hand, their masks compared across five kinds until every field held one bit, then the grammar run over every chunk of the tile's blob at its index's offsets",
    },
    {
      found:
        "A 64-bit path hash is the asset index's PathHashPre in its low byte and PathHashLast in the four above, so it names its prefab's _Vo path; through it about half the placements round the statue are named, the ruins, rocks, grass and decals. The 32-bit id is no hash of any path spelling, and GlobalFinMap's keys are path hashes with no 32-bit id at a fixed offset from them",
      search:
        "Every placement's 64-bit hash looked up in the 2.6 index; CRC32, FNV-1 and FNV-1a, Java's, MD5's and SHA-1's low words over each named path's spellings tested against its 32-bit id; GlobalFinMap read for both",
    },
    {
      found:
        "The oak stands in Windrise's own area, Area_FQD_City (FQD for Fēng Qǐ Dì, the region's Chinese name), not the tile: its StreamGen blob places one prefab, unturned at unit scale, and the area's HLOD draws a trunk rising from that point and the crown over the statue. The oak's Lod1 prefab has its root at its origin, so the record is the oak's place. The tile's own placements, its HLOD and its tree layer hold no oak",
      search:
        "The tile's placements by radius and rarity, its HLOD and its tree layer's combined meshes for anything tall round the statue, then every area under OpenWorld/BigWorld in the 2.6 index, the area's blob and HLOD exported",
    },
    {
      found:
        "The statue's prefab is SceneObj_NPC_Goddess: the gadget's prefabPathHash holds that path's PathHashPre and PathHashLast as a placement's 64-bit hash does, and of the gadget roots holding Stages_MdGoddess01_Lod0 it is the one without a nation's suffix",
      search:
        "The CABs that depend on the statue meshes' CAB through AnimeStudio's CAB map, their GameObjects named Goddess, then GadgetExcelConfigData's prefab hash for gadget 70110001 decoded against the 2.6 index",
    },
    {
      found:
        "A tile's heights are a TerrainData, 513 samples a side two metres apart over a kilometre of height, which AnimeStudio exports unparsed as TerrainData#<n> with its name only inside its bytes, so no name filter reaches it",
      search:
        "TerrainData exported raw from the tile's texture blocks, which held tile 1,1's, its heightfield found by the square count followed by its error and bound arrays and its side twice",
    },
    {
      found:
        "Tiles 1,-2, 2,-2 and 1,-1 are in 00/00945879.blk and 2,-1 in 00/13138169.blk. A tile's samples run along z within each column of x, stand on the world's zero, and match the tile's ground placements to a tenth of a metre at the median",
      search:
        "Every TerrainData of every block exported raw and named by the string its bytes lead with, then the tile's heights compared with every small placement's height in both orders",
    },
    {
      found:
        "The valley's water is one surface the tile places, Area_Md_Water_Common_01_Vo, a kilometre across at the height the south pond's own plane stands at. The tile's WaterPlane prefabs hold three ponds as children of a root no stream was found placing",
      search:
        "The tile's placements named by their path hash for water, then the WaterPlane prefabs' GameObjects and Transforms in their blocks, each pond's height tested against its bed and shore in the heightfield",
    },
    {
      found:
        "BigWorld_1_-2, a SectorBinData script, holds about fourteen hundred positions packed twelve bytes apart, every one inside the tile, those round the statue within two metres of its height: points on the ground about one every 27 metres, exact data a fitted ground can be held to. BigWorld_1_-2_Index, its sibling, holds no position in the tile's range",
      search:
        "The asset index for MonoBehaviours naming the tile, then each one's raw bytes scanned at every offset for three floats inside the tile's x and z and a height of the region's",
    },
  ],
  open: [
    "The prefabs of the placements carrying only the world's 32-bit id, the trees round the statue among them, and the paths newer than the 2.6 index",
    "Our statue and oak where the witness stands them: the statue's place, its turn and which of its levels the recordings show",
    "The ponds above the valley's water: the tile's WaterPlane prefabs, whose root stands at its 512-metre cell's centre and 200 metres up by every pond's bed and shore, a place inferred rather than read",
    "Each recording's camera, solved with landmarks named on the witness, and then the parity references at the hours each recording shows",
    "Mondstadt's sky by hour, from its Enviro profile's raw bytes as the login's was read",
  ],
  sources: {
    assetIndex: {
      block: "radioegor146/gi-asset-indexes, mapped/GenshinImpact_2.6.0.zip_31049740.blk.asset_index.json",
      kind: GameSourceKind.DataTable,
      name: "The game's asset index of version 2.6",
      role: "Every asset's path by its PathHashPre and PathHashLast, which name a streamed blob and a placement's prefab",
    },
    groundHeights: {
      block: "00/00945879.blk, tile 2,-1's in 00/13138169.blk",
      kind: GameSourceKind.TerrainData,
      name: "BigWorldTerrain_1_-2.bin, BigWorldTerrain_2_-2.bin, BigWorldTerrain_1_-1.bin, BigWorldTerrain_2_-1.bin",
      role: "The valley's ground and the slopes north of it, which ground.json's hills are fitted to",
    },
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
      role: "Points on Windrise's ground, sparse and exact, a check on the heightfield read from the tile's TerrainData",
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
    oakCrown: {
      block: "00/08480638.blk",
      kind: GameSourceKind.Mesh,
      name: "Area_FQD_City_Constant_HLOD_Lod1",
      role: "Windrise's area drawn far off, the oak's trunk and crown among it, which confirms where the area places the oak",
    },
    oakMaterials: {
      block: "00/00495653.blk",
      kind: GameSourceKind.Material,
      name: "Stages_Unique_CyTree01_Bark01, Stages_Unique_CyTree01_Bark02",
      role: "The oak's bark, in the block holding the statue's material too",
    },
    oakPlacement: {
      block: "00/03254716.blk",
      kind: GameSourceKind.BinaryData,
      name: "6977197b, StreamGen/Area_FQD_City",
      role: "Windrise's own area, whose one placement is the oak's, its chunk offsets in Area_FQD_City_Index beside it",
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
    statuePrefab: {
      block: "00/04803507.blk",
      kind: GameSourceKind.GameObject,
      name: "SceneObj_NPC_Goddess",
      role: "The statue gadget's prefab, which hangs the Stages_MdGoddess01 meshes under its root",
    },
    statueTimelapse: {
      block: "yt-zPDi6WBJW9Y.mp4",
      kind: GameSourceKind.Capture,
      name: "Windrise Ambience, a 2026 PC recording from a fixed camera through a whole day",
      role: "The statue under the oak at every hour on the current build, a game minute a second",
    },
    tilePlacements: {
      block: "00/05825684.blk",
      kind: GameSourceKind.BinaryData,
      name: "012854bd, StreamGen/BigWorld_1_-2",
      role: "Every object the tile lays out, the ruins, rocks and grass round the statue among them, its chunk offsets in BigWorld_1_-2_Index in the same block",
    },
    water: {
      block: "00/05825684.blk, 012854bd",
      kind: GameSourceKind.BinaryData,
      name: "Area_Md_Water_Common_01_Vo, placed by the tile's StreamGen blob",
      role: "The valley's water surface, a kilometre across, whose height water.json's level is",
    },
    valleyTimelapse: {
      block: "yt-w-63Sw6IP2w.mp4",
      kind: GameSourceKind.Capture,
      name: "Windswept Wilderness (Windrise) Timelapse Ambience, a 2022 recording",
      role: "The valley from the south through a whole day, a game minute a second, on an older build",
    },
  },
};
