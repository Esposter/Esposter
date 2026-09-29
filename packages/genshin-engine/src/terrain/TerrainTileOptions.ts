import type { TerrainOptions } from "#src/terrain/TerrainOptions";

export interface TerrainTileOptions extends Pick<TerrainOptions, "cellsPerSide" | "finestTileSize"> {
  // The ground's height at a point in world coordinates, in metres
  getHeight: (x: number, z: number) => number;
  key: number;
  // Writes the ground's colour at a point into the colours at the offset, as linear red, green and blue from 0 to 1,
  // Given its height and how steep it is from 0 when flat to 1 when sheer, so no colour is allocated per vertex
  writeColor: (colors: Float32Array, offset: number, height: number, slope: number, x: number, z: number) => void;
}
