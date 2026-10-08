import type { TerrainTile } from "genshin-engine";

// A terrain tile and the plants scattered on it: each plant's matrix, relative to the tile's corner, and its colour, in
// The linear working space. A tile past the finest level grows none, too far for a plant to show
export interface PlantedTerrainTile extends TerrainTile {
  plantColors: Float32Array;
  plantMatrices: Float32Array;
}
