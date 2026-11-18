import { existsSync } from "node:fs";
import { join } from "node:path";

// The terrain tiles whose mesh is on disk in a component's exports, the mesh the witness draws each from. A world names
// Its tiles by their TerrainData, so a tile named there but with no mesh left is not exported
export const readExportedTerrainTiles = (terrainTiles: readonly string[], meshDirectory: string): string[] =>
  terrainTiles.filter((name) => existsSync(join(meshDirectory, `${name}.obj`)));
