import type { AssetPlacement } from "#src/models/genshinAssets/AssetPlacement";

import { blurWithinTags } from "#src/services/genshinAssets/blurWithinTags";
import { rasterizeTopFaces } from "#src/services/genshinAssets/rasterizeTopFaces";
import { readMaterialNames } from "#src/services/genshinAssets/readMaterialNames";
import { readObjMesh } from "#src/services/genshinAssets/readObjMesh";
import { readOtsuThreshold } from "#src/services/genshinAssets/readOtsuThreshold";
import { toRightHanded } from "#src/services/genshinAssets/toRightHanded";
import { toTexel } from "#src/services/genshinAssets/toTexel";
import { toWorldVertices } from "#src/services/genshinAssets/toWorldVertices";
import { traceCellLoops } from "#src/services/genshinAssets/traceCellLoops";
import { join } from "node:path";
import sharp from "sharp";

const WALKWAY_MESH_REGEX = /^LoginScene_Bridge01_\d+_Vo$/u;
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
type Loop = [number, number][];
// The walkway's paving as the pockets its stone is set with, each a loop in three's axes over one copy of the walkway
// As `fitLoginWalkway` lays out its pieces, inside the plan's corner and size: every pocket sunk into its side lanes'
// And its wings' stone. Each piece's faces that look up are drawn into a plan through their own texture coordinates
// (`rasterizeTopFaces`), each cell reading its material's texture. A pocket is the stone darker than its material's
// Threshold between its two tones, read past its speckle. The middle lane's bricks are left as its stone: their joints
// Drawn as lines, at any darkness, scored the walkway worse against the game's own exports
export const fitLoginPaving = async (
  placements: readonly AssetPlacement[],
  meshDirectory: string,
  textureDirectory: string,
): Promise<{ corner: [number, number]; pockets: Loop[]; size: [number, number] }> => {
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
  const readTexel = (cell: number): [number, number] =>
    toTexel(
      [values[cell * 2] ?? 0, values[cell * 2 + 1] ?? 0],
      (textures[tags[cell] ?? 0] ?? { info: { height: 1, width: 1 } }).info,
    );
  const grey = new Float32Array(width * height);
  for (let cell = 0; cell < width * height; cell++) {
    const texture = textures[tags[cell] ?? -1];
    if (!texture) continue;
    const [column, row] = readTexel(cell);
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
  const pockets = materialNames.flatMap((material, tag) => {
    if (!POCKET_MATERIALS.has(material)) return [];
    const cells = Array.from({ length: width * height }, (_, cell) => cell).filter((cell) => tags[cell] === tag);
    const threshold = readOtsuThreshold(cells.map((cell) => blurred[cell] ?? 0));
    return traceCells(cells.filter((cell) => (blurred[cell] ?? 0) < threshold));
  });
  return { corner: PLAN_CORNER, pockets, size: PLAN_SIZE };
};
