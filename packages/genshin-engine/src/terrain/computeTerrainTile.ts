import type { TerrainTile } from "#src/models/terrain/TerrainTile";
import type { TerrainTileOptions } from "#src/models/terrain/TerrainTileOptions";

import { getTerrainTileColumn } from "#src/terrain/getTerrainTileColumn";
import { getTerrainTileLevel } from "#src/terrain/getTerrainTileLevel";
import { getTerrainTileRow } from "#src/terrain/getTerrainTileRow";

// How many vertices the heights reach past the tile on every side: the next level's normals are taken two vertices
// Either side of an even vertex, its own grid's one
const HEIGHT_PADDING = 2;
// Writes the normal at a padded height by central differences over the vertices `reach` either side, and returns its
// Upward component, which sets the ground's slope
const writeNormal = (
  normals: Float32Array,
  offset: number,
  heights: Float32Array,
  paddedIndex: number,
  paddedSide: number,
  reach: number,
  step: number,
): number => {
  const height = heights[paddedIndex] ?? 0;
  const normalX = (heights[paddedIndex - reach] ?? height) - (heights[paddedIndex + reach] ?? height);
  const normalY = 2 * reach * step;
  const normalZ =
    (heights[paddedIndex - reach * paddedSide] ?? height) - (heights[paddedIndex + reach * paddedSide] ?? height);
  const length = Math.hypot(normalX, normalY, normalZ);
  normals[offset] = normalX / length;
  normals[offset + 1] = normalY / length;
  normals[offset + 2] = normalZ / length;
  return normalY / length;
};
// A tile's grid sampled from the region's heights. Heights are read once each into a buffer reaching past the tile on
// Every side, so every normal is taken from its neighbours by central differences, the edge's included, and a tile's
// Edge normal matches its neighbour's. A vertex's coarse position, normal and colour are the even vertex's it
// Collapses onto on the next level's grid, that level's normal taken across its own wider cells, so the fully morphed
// Tile is exactly that level's ground and a change of level redraws nothing
export const computeTerrainTile = ({
  cellsPerSide,
  finestTileSize,
  getHeight,
  key,
  writeColor,
}: TerrainTileOptions): TerrainTile => {
  const level = getTerrainTileLevel(key);
  const size = finestTileSize * 2 ** level;
  const step = size / cellsPerSide;
  const left = getTerrainTileColumn(key) * size;
  const back = getTerrainTileRow(key) * size;
  const side = cellsPerSide + 1;
  const paddedSide = side + HEIGHT_PADDING * 2;
  const heights = new Float32Array(paddedSide * paddedSide);
  for (let row = 0; row < paddedSide; row++)
    for (let column = 0; column < paddedSide; column++)
      heights[row * paddedSide + column] = getHeight(
        left + (column - HEIGHT_PADDING) * step,
        back + (row - HEIGHT_PADDING) * step,
      );

  const vertexCount = side * side;
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const colors = new Float32Array(vertexCount * 3);
  const coarsePositions = new Float32Array(vertexCount * 4);
  const coarseNormals = new Float32Array(vertexCount * 3);
  const coarseColors = new Float32Array(vertexCount * 3);
  for (let row = 0; row < side; row++)
    for (let column = 0; column < side; column++) {
      const paddedIndex = (row + HEIGHT_PADDING) * paddedSide + column + HEIGHT_PADDING;
      const height = heights[paddedIndex] ?? 0;
      const index = row * side + column;
      const offset = index * 3;
      const x = column * step;
      const z = row * step;
      positions[offset] = x;
      positions[offset + 1] = height;
      positions[offset + 2] = z;
      const normalY = writeNormal(normals, offset, heights, paddedIndex, paddedSide, 1, step);
      writeColor(colors, offset, height, 1 - normalY, left + x, back + z);
      const coarseColumn = column - (column % 2);
      const coarseRow = row - (row % 2);
      const coarseOffset = index * 4;
      coarsePositions[coarseOffset] = coarseColumn * step;
      coarsePositions[coarseOffset + 1] =
        heights[(coarseRow + HEIGHT_PADDING) * paddedSide + coarseColumn + HEIGHT_PADDING] ?? height;
      coarsePositions[coarseOffset + 2] = coarseRow * step;
      coarsePositions[coarseOffset + 3] = level;
      // An even vertex comes before every odd one collapsing onto it, so its coarse normal and colour are copied
      if (coarseColumn !== column || coarseRow !== row) {
        const evenOffset = (coarseRow * side + coarseColumn) * 3;
        for (let component = 0; component < 3; component++) {
          coarseNormals[offset + component] = coarseNormals[evenOffset + component] ?? 0;
          coarseColors[offset + component] = coarseColors[evenOffset + component] ?? 0;
        }
        continue;
      }
      const coarseNormalY = writeNormal(coarseNormals, offset, heights, paddedIndex, paddedSide, 2, step);
      writeColor(coarseColors, offset, height, 1 - coarseNormalY, left + x, back + z);
    }

  return { coarseColors, coarseNormals, coarsePositions, colors, key, normals, positions };
};
