import type { Loop } from "#src/models/genshinAssets/fit/Loop";
import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";

import { blurWithinTags } from "#src/services/genshinAssets/fit/blurWithinTags";
import { rasterizeTopFaces } from "#src/services/genshinAssets/fit/rasterizeTopFaces";
import { readMaterialNames } from "#src/services/genshinAssets/fit/readMaterialNames";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { toTexel } from "#src/services/genshinAssets/fit/toTexel";
import { toWorldVertices } from "#src/services/genshinAssets/fit/toWorldVertices";
import { traceCellLoops } from "#src/services/genshinAssets/fit/traceCellLoops";
import { computeOtsuThreshold } from "#src/services/genshinAssets/shared/computeOtsuThreshold";
import { WALKWAY_MESH_REGEX } from "#src/services/genshinAssets/shared/constants";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { BYTE } from "#src/services/shared/constants";
import { join } from "node:path";
import sharp from "sharp";

// The materials whose stone is set with pockets, the side lanes' and the wings'
const POCKET_MATERIALS = new Set(["LoginScene_Bridge01", "LoginScene_Bridge02"]);
// The plan's cells, a centimetre each, over one copy of the walkway and its wings
const CELL_SIZE = 0.01;
const PLAN_CORNER: [number, number] = [-2, -8];
const PLAN_SIZE: [number, number] = [4, 16];
// A face looks up where its normal's height is past this, and stands on the walkway's top where its middle is above
// Halfway down to the underside
const UP_NORMAL_HEIGHT = 0.95;
const TOP_FLOOR = -0.25;
// A pocket's stone is read over the cells this far round it, past the speckle the texture paints its stone with
const POCKET_BLUR_CELLS = 2;
// A loop smaller than this many cells is a speck of the stone's paint, not a pocket
const MIN_LOOP_CELLS = 40;
// The tolerance in cells each loop is simplified to
const LOOP_TOLERANCE_CELLS = 1;
// A normal's tilt, its slope off the stone's own face, read up to this much for the split between the stone's flat and
// Its bevels
const MAX_TILT = 2;
// A bevel within this many cells of a pocket's edge is that pocket's rim; one further off is a groove of its own, a
// Joint between two bricks or a lane's border
const RIM_REACH_CELLS = 4;
// The walkway's paving as the pockets its stone is set with, each a loop in three's axes over one copy of the walkway
// As `fitLoginWalkway` lays out its pieces, inside the plan's corner and size: every pocket sunk into its side lanes'
// And its wings' stone. Each piece's faces that look up are drawn into a plan through their own texture coordinates
// (`rasterizeTopFaces`), each cell reading its material's texture. A pocket is the stone darker than its material's
// Threshold between its two tones, read past its speckle. The stone's carving is in its normal map, which the game
// Lights: a bevel is a cell whose normal tilts past the split between the stone's flat and its bevels (Otsu's), its
// Slope the bevels' median tilt; a pocket's rim is a bevel by a pocket's edge, the rims' width their area over the
// Pockets' edges' length; and a groove is the stone tilted anywhere else, the joints between the bricks and the lanes'
// Borders, split from the flat stone under the rims by the same split again, traced as loops like the pockets, with
// Their own median slope
export const fitLoginPaving = async (
  placements: readonly AssetPlacement[],
  meshDirectory: string,
  textureDirectory: string,
): Promise<{
  bevel: { slope: number; width: number };
  corner: [number, number];
  grooves: Loop[];
  grooveSlope: number;
  pockets: Loop[];
  size: [number, number];
}> => {
  const walkwayPlacements = placements.filter(({ mesh }) => WALKWAY_MESH_REGEX.test(mesh));
  const pathIdNameMap = await readMaterialNames(walkwayPlacements);
  const materialNames = [...new Set(pathIdNameMap.values())];
  const faces = (
    await Promise.all(
      walkwayPlacements.map(async (placement) => {
        const {
          faceGroups,
          faces: meshFaces,
          faceUvs,
          uvs,
          vertices,
        } = await readObjMesh(join(meshDirectory, `${placement.mesh}.obj`));
        const world = toWorldVertices(vertices, placement).map((vertex) => toRightHanded(vertex));
        return meshFaces.flatMap((face, index) => {
          const [a, b, c] = face.map((vertex) => world[vertex]);
          if (!a || !b || !c) return [];
          const normal = [
            (b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]),
            (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]),
            (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]),
          ];
          if (
            Math.abs(normal[1] ?? 0) / Math.hypot(...normal) < UP_NORMAL_HEIGHT ||
            (a[1] + b[1] + c[1]) / 3 < TOP_FLOOR
          )
            return [];
          // A submesh's group is named for its index among the renderer's materials
          const submesh = Number(/_(?<submesh>\d+)$/u.exec(faceGroups[index] ?? "")?.groups?.submesh ?? 0);
          const material = pathIdNameMap.get(placement.materials[submesh] ?? "") ?? "";
          return [
            {
              corners: [a, b, c],
              tag: materialNames.indexOf(material),
              values: (faceUvs[index] ?? []).map((uv): [number, number] => uvs[uv] ?? [0, 0]),
            },
          ];
        });
      }),
    )
  ).flat();
  const width = Math.round(PLAN_SIZE[0] / CELL_SIZE);
  const height = Math.round(PLAN_SIZE[1] / CELL_SIZE);
  const { tags, values } = rasterizeTopFaces(faces, { cellSize: CELL_SIZE, corner: PLAN_CORNER, height, width });
  const textures = await Promise.all(
    materialNames.map((name) =>
      sharp(join(textureDirectory, `${name}_Diffuse.png`))
        .greyscale()
        .raw()
        .toBuffer({ resolveWithObject: true }),
    ),
  );
  // Each cell's texel in its material's texture, its coordinates tiled and its rows read from the top
  const getTexel = (cell: number): [number, number] =>
    toTexel(
      [values[cell * 2] ?? 0, values[cell * 2 + 1] ?? 0],
      (textures[tags[cell] ?? 0] ?? { info: { height: 1, width: 1 } }).info,
    );
  const grey = new Float32Array(width * height);
  for (let cell = 0; cell < width * height; cell++) {
    const texture = textures[tags[cell] ?? -1];
    if (!texture) continue;
    const [column, row] = getTexel(cell);
    grey[cell] = texture.data[(row * texture.info.width + column) * texture.info.channels] ?? 0;
  }
  const traceCells = (cells: readonly number[]): Loop[] =>
    traceCellLoops(cells, {
      cellSize: CELL_SIZE,
      corner: PLAN_CORNER,
      minCells: MIN_LOOP_CELLS,
      tolerance: LOOP_TOLERANCE_CELLS,
      width,
    });
  // Each cell's stone read over its neighbours of its own material, past the speckle the texture paints it with
  const blurred = blurWithinTags(grey, tags, { height, radius: POCKET_BLUR_CELLS, width });
  const isPocket = new Uint8Array(width * height);
  const pockets = materialNames.flatMap((material, tag) => {
    if (!POCKET_MATERIALS.has(material)) return [];
    const cells = Array.from({ length: width * height }, (_, cell) => cell).filter((cell) => tags[cell] === tag);
    const threshold = computeOtsuThreshold(cells.map((cell) => blurred[cell] ?? 0));
    const pocketCells = cells.filter((cell) => (blurred[cell] ?? 0) < threshold);
    for (const cell of pocketCells) isPocket[cell] = 1;
    return traceCells(pocketCells);
  });
  const normals = await Promise.all(
    materialNames.map((name) =>
      sharp(join(textureDirectory, `${name}_Normal.png`))
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true }),
    ),
  );
  // Each cell's normal's tilt off its face, as the slope of the stone there
  const tilts = Float32Array.from({ length: width * height }, (_, cell) => {
    const normal = normals[tags[cell] ?? -1];
    if (!normal) return 0;
    const [column, row] = toTexel([values[cell * 2] ?? 0, values[cell * 2 + 1] ?? 0], normal.info);
    const texel = (row * normal.info.width + column) * normal.info.channels;
    const [x, y, z] = [0, 1, 2].map((channel) => ((normal.data[texel + channel] ?? 0) / BYTE) * 2 - 1);
    return Math.min(Math.hypot(x ?? 0, y ?? 0) / Math.max(z ?? 0, Number.EPSILON), MAX_TILT);
  });
  const topCells = Array.from({ length: width * height }, (_, cell) => cell).filter(
    (cell) => normals[tags[cell] ?? -1],
  );
  const computeTiltThreshold = (cells: readonly number[]): number =>
    (computeOtsuThreshold(cells.map((cell) => ((tilts[cell] ?? 0) / MAX_TILT) * BYTE)) / BYTE) * MAX_TILT;
  const tiltThreshold = computeTiltThreshold(topCells);
  const bevelCells = topCells.filter((cell) => (tilts[cell] ?? 0) > tiltThreshold);
  // The joints between the bricks tilt less than a pocket's rim, so they are split from the flat stone under the rims
  const jointThreshold = computeTiltThreshold(topCells.filter((cell) => (tilts[cell] ?? 0) <= tiltThreshold));
  const computeMedianTilt = (cells: readonly number[]): number =>
    cells.map((cell) => tilts[cell] ?? 0).toSorted((first, second) => first - second)[Math.floor(cells.length / 2)] ??
    0;
  // A bevel is a pocket's rim where a pocket's edge lies within reach of it: both a pocket's cell and its lane's
  const checkIsRim = (cell: number): boolean => {
    const [column, row] = [cell % width, Math.floor(cell / width)];
    let [pocketCount, laneCount] = [0, 0];
    for (let rowOffset = -RIM_REACH_CELLS; rowOffset <= RIM_REACH_CELLS; rowOffset++)
      for (let columnOffset = -RIM_REACH_CELLS; columnOffset <= RIM_REACH_CELLS; columnOffset++) {
        const [nearColumn, nearRow] = [column + columnOffset, row + rowOffset];
        if (nearColumn < 0 || nearRow < 0 || nearColumn >= width || nearRow >= height) continue;
        if (isPocket[nearRow * width + nearColumn]) pocketCount++;
        else laneCount++;
      }
    return pocketCount > 0 && laneCount > 0;
  };
  const rimCells = bevelCells.filter((cell) => checkIsRim(cell));
  const rims = new Set(rimCells);
  const grooveCells = topCells.filter((cell) => (tilts[cell] ?? 0) > jointThreshold && !rims.has(cell));
  // Which way a rim falls: a normal leans downhill, so along the texture's first axis as it lies on the plan, the
  // Rims' normals lean into their pockets where the pockets are sunk and out of them where they stand proud
  let lean = 0;
  for (const cell of rimCells) {
    const normal = normals[tags[cell] ?? -1];
    const [right, left, down, up] = [cell + 1, cell - 1, cell + width, cell - width];
    if (!normal || [right, left, down, up].some((near) => tags[near] !== tags[cell])) continue;
    const getU = (near: number): number => values[near * 2] ?? 0;
    // The plan's direction the texture's first axis runs along, and the direction into the pocket
    const tangent = [getU(right) - getU(left), getU(down) - getU(up)];
    const inward = [(blurred[left] ?? 0) - (blurred[right] ?? 0), (blurred[up] ?? 0) - (blurred[down] ?? 0)];
    const [column, row] = toTexel([values[cell * 2] ?? 0, values[cell * 2 + 1] ?? 0], normal.info);
    const x = ((normal.data[(row * normal.info.width + column) * normal.info.channels] ?? 0) / BYTE) * 2 - 1;
    lean += x * Math.sign((tangent[0] ?? 0) * (inward[0] ?? 0) + (tangent[1] ?? 0) * (inward[1] ?? 0));
  }
  const edgeLength = pockets.reduce(
    (sum, loop) =>
      sum +
      loop.reduce((length, [x, y], index) => {
        const [nextX, nextY] = loop[(index + 1) % loop.length] ?? [x, y];
        return length + Math.hypot(nextX - x, nextY - y);
      }, 0),
    0,
  );
  return {
    bevel: {
      // Past none where the pockets are sunk
      slope: roundFitted(Math.sign(lean) * computeMedianTilt(rimCells)),
      width: roundFitted((rimCells.length * CELL_SIZE ** 2) / Math.max(edgeLength, Number.EPSILON)),
    },
    corner: PLAN_CORNER,
    grooves: traceCells(grooveCells),
    grooveSlope: roundFitted(computeMedianTilt(grooveCells)),
    pockets,
    size: PLAN_SIZE,
  };
};
