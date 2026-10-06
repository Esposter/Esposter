import { TERRAIN_TILE_REGEX } from "#src/services/genshinAssets/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A terrain tile's column and row read off its TerrainData's name (BigWorldTerrain_1_-2.bin is column 1, row -2); a
// Name of no tile is an error, so no tile is laid out at the origin by mistake
export const parseTerrainTileName = (name: string): { column: number; row: number } => {
  const { column, row } = TERRAIN_TILE_REGEX.exec(name)?.groups ?? {};
  if (column === undefined || row === undefined)
    throw new InvalidOperationError(Operation.Read, name, "names no terrain tile");
  return { column: Number(column), row: Number(row) };
};
