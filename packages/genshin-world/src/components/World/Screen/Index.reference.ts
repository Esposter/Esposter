import type { ComponentReference } from "genshin-interface";

import { groundTopic } from "#src/components/World/Screen/Ground.reference";
import { oakTopic } from "#src/components/World/Screen/Oak.reference";
import { parityPageTopic } from "#src/components/World/Screen/ParityPage.reference";
import { recordingsTopic } from "#src/components/World/Screen/Recordings.reference";
import { skyTopic } from "#src/components/World/Screen/Sky.reference";
import { statueTopic } from "#src/components/World/Screen/Statue.reference";
import { streamingTopic } from "#src/components/World/Screen/Streaming.reference";
import { waterTopic } from "#src/components/World/Screen/Water.reference";
import { GameSourceKind } from "genshin-interface";

// Windrise's sources in the game's data and in public recordings, and its topics, each with what every investigation
// Found and what is still open. A ground tile is the game's own, 1024 metres on a side, its column the world's x over
// 1024 and its row its z
export const reference: ComponentReference = {
  sources: {
    assetIndex: {
      kind: GameSourceKind.DataTable,
      name: "The game's asset index of version 2.6",
      role: "Every asset's path by its PathHashPre and PathHashLast, which name a streamed blob and a placement's prefab",
      table: "radioegor146/gi-asset-indexes, mapped/GenshinImpact_2.6.0.zip_31049740.blk.asset_index.json",
    },
    groundHeights: {
      block: "00/00945879.blk, tile 2,-1's in 00/13138169.blk",
      kind: GameSourceKind.TerrainData,
      name: "BigWorldTerrain_1_-2.bin, BigWorldTerrain_2_-2.bin, BigWorldTerrain_1_-1.bin, BigWorldTerrain_2_-1.bin",
      role: "The valley's ground and the slopes north of it, which base-ground.json's hills are fitted to",
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
      capture: "yt-2IPBviDPFB8.mp4",
      kind: GameSourceKind.Capture,
      name: "[4K] Windrise, Mondstadt Ambience, a 2026 PC recording from a fixed camera with Venti in its lower left",
      role: "The oak by day at 2160 high on the current build, over the hour from 25 minutes in",
    },
    oakTimelapse: {
      capture: "yt-qJHuDThRieE.mp4",
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
      kind: GameSourceKind.DataTable,
      name: "70110001 SceneObj_Resident_Goddess",
      role: "The statue as a gadget, which the scene points name",
      table: "ExcelBinOutput/GadgetExcelConfigData.json",
    },
    statuePoint: {
      kind: GameSourceKind.DataTable,
      name: "Point 4",
      role: "Where Windrise's statue stands and how it turns, and where its teleport sets the traveller down",
      table: "BinOutput/Scene/Point/scene3_point.json",
    },
    statuePrefab: {
      block: "00/04803507.blk",
      kind: GameSourceKind.GameObject,
      name: "SceneObj_NPC_Goddess",
      role: "The statue gadget's prefab, which hangs the Stages_MdGoddess01 meshes under its root",
    },
    statueTimelapse: {
      capture: "yt-zPDi6WBJW9Y.mp4",
      kind: GameSourceKind.Capture,
      name: "Windrise Ambience, a 2026 PC recording from a fixed camera through a whole day",
      parityReference: "windrise-statue-day",
      role: "The statue under the oak at every hour on the current build, a game minute a second",
    },
    tilePlacements: {
      block: "00/05825684.blk",
      kind: GameSourceKind.BinaryData,
      name: "012854bd, StreamGen/BigWorld_1_-2",
      role: "Every object the tile lays out, the ruins, rocks and grass round the statue among them, its chunk offsets in BigWorld_1_-2_Index in the same block",
    },
    valleyTimelapse: {
      capture: "yt-w-63Sw6IP2w.mp4",
      kind: GameSourceKind.Capture,
      name: "Windswept Wilderness (Windrise) Timelapse Ambience, a 2022 recording",
      role: "The valley from the south through a whole day, a game minute a second, on an older build",
    },
    water: {
      block: "00/05825684.blk, 012854bd",
      kind: GameSourceKind.BinaryData,
      name: "Area_Md_Water_Common_01_Vo, placed by the tile's StreamGen blob",
      role: "The valley's water surface, a kilometre across, whose height water.json's level is",
    },
  },
  topics: {
    ground: groundTopic,
    oak: oakTopic,
    parityPage: parityPageTopic,
    recordings: recordingsTopic,
    sky: skyTopic,
    statue: statueTopic,
    streaming: streamingTopic,
    water: waterTopic,
  },
};
