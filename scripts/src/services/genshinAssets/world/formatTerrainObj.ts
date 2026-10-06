import type { TerrainHeights } from "#src/models/genshinAssets/world/TerrainHeights";

// A terrain tile's heightfield as an OBJ mesh in the axes AnimeStudio exports a mesh in, x negated, so the witness
// Turns it as it turns every export: a vertex a sample, from the tile's corner along x within a row and along z row by
// Row, its coordinates the tile's base map's, and two triangles a cell, counter-clockwise seen from above in the
// Mirrored axes so the ground faces up as the exports' faces do
export const formatTerrainObj = (name: string, { heights, resolution, spacing }: TerrainHeights): string => {
  const lines = [`g ${name}`];
  const last = resolution - 1;
  for (let row = 0; row < resolution; row++)
    for (let column = 0; column < resolution; column++)
      lines.push(`v ${-column * spacing} ${heights[row * resolution + column] ?? 0} ${row * spacing}`);
  for (let row = 0; row < resolution; row++)
    for (let column = 0; column < resolution; column++) lines.push(`vt ${column / last} ${row / last}`);
  for (let row = 0; row < last; row++)
    for (let column = 0; column < last; column++) {
      const corner = row * resolution + column + 1;
      const right = corner + 1;
      const below = corner + resolution;
      const belowRight = below + 1;
      lines.push(
        `f ${corner}/${corner} ${right}/${right} ${below}/${below}`,
        `f ${right}/${right} ${belowRight}/${belowRight} ${below}/${below}`,
      );
    }
  return `${lines.join("\n")}\n`;
};
