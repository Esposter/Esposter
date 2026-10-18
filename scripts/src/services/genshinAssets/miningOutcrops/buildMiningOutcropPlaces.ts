import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { MINING_OUTCROP_LABEL_ID } from "#src/services/genshinAssets/miningOutcrops/constants";
import { buildFittedMapPointSlices } from "#src/services/genshinAssets/points/buildFittedMapPointSlices";
import { GameDataset, MAGICAL_CRYSTAL_CHUNK_ITEM_ID } from "genshin-world";

// Each region's mining outcrop places as one slice of the mining outcrops dataset: each Magical Crystal Chunk point the
// Official map marks, carried into the scene by the fit, its kind the Chunk's item id. The notes count each region's
// Places and what was left out
export const buildMiningOutcropPlaces = (): Promise<GameDataBuild> =>
  buildFittedMapPointSlices(
    GameDataset.MiningOutcrops,
    new Map([[MINING_OUTCROP_LABEL_ID, MAGICAL_CRYSTAL_CHUNK_ITEM_ID]]),
    "mining-outcrop",
    "mining outcrops",
  );
