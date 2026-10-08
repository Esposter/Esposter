import { PARITY_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { join } from "node:path";

// The open world's streams: a tile's StreamGen blob and a city area's are named by their path's hash under this folder,
// Each blob's index beside it under the same name with this suffix (`getStreamBlobName`)
export const STREAM_PATH_PREFIX = "Build/LevelStreaming/Level/OpenWorld/BigWorld/StreamGen/";
export const STREAM_INDEX_SUFFIX = "_Index";
// A tile's name, its column and row, and its terrain's TerrainData, which the tile's name names with the `.bin` suffix
export const TILE_NAME_PREFIX = "BigWorld";
export const TERRAIN_NAME_PREFIX = "BigWorldTerrain";
export const TERRAIN_NAME_SUFFIX = ".bin";
// The half side of the square round a capital that its reference is shot across, in metres either way. A city's view
// Covers its own tile's width and a little past it
export const CAPITAL_VIEW_METRES = 512;
// The radius round a capital's landmark, in metres, within which the architecture its prefabs are built of is rooted
// Whole, past the view: a landmark stands on a tower or a wall the view's edge can cut. Its tiles are read as well
export const ARCHITECTURE_VIEW_METRES = 600;
// The file a derived world block is written beside its exports, which every reader of the world reads back
export const WORLD_JSON_NAME = "world.json";
// The community's asset index (the one published per version up to 2.6), which names every asset by its path and so
// Turns a placement's 64-bit path hash back into the prefab's name. Read by the derivation alone
export const ASSET_PATH_INDEX_PATH: string = join(PARITY_DIRECTORY, "tmp", "asset-index", "gi-2.6.0.json");
