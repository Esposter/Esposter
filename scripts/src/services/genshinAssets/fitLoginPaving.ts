import type { AssetPlacement } from "#src/models/genshinAssets/AssetPlacement";

import { blurWithinTags } from "#src/services/genshinAssets/blurWithinTags";
import { findProfileMinima } from "#src/services/genshinAssets/findProfileMinima";
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
// The materials whose stone is set with pockets, the side lanes' and the wings', and the one laid in bricks
const POCKET_MATERIALS = new Set(["LoginScene_Bridge01", "LoginScene_Bridge02"]);
const BRICK_MATERIAL = "LoginScene_Ground02";
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
// A loop smaller than this many cells is a speck of the stone's paint, not a pocket or a brick
const MIN_LOOP_CELLS = 40;
// The tolerance in cells each loop is simplified to
const LOOP_TOLERANCE_CELLS = 1;
// The brick texture's joints: each course's mean brightness down a column, darkest within a few texels and darker than
// The bricks either side, and the courses the same down a row
const JOINT_OPTIONS = { prominence: 6, radius: 6, sideRange: [8, 20] } as const;
// The rows of a course read for its joints, clear of the lines between courses
const COURSE_INSET_SHARE = 0.125;
type Loop = [number, number][];
// The walkway's paving as the lines its stone is set out by, each a loop in three's axes over one copy of the walkway
// As `fitLoginWalkway` lays out its pieces, inside the plan's corner and size: every brick of its middle lane, and
// Every pocket sunk into its side lanes' and its wings' stone. Each piece's faces that look up are drawn into a plan
// Through their own texture coordinates (`rasterizeTopFaces`), each cell reading its material's texture. A pocket is the stone darker than its material's
// Threshold between its two tones, read past its speckle. A brick is the cells of one course of the brick texture
// Between one joint and the next, the texture's own, so each brick is laid where the game's coordinates lay it
export const fitLoginPaving = async (
  placements: readonly AssetPlacement[],
  meshDirectory: string,
  textureDirectory: string,
): Promise<{ bricks: Loop[]; corner: [number, number]; pockets: Loop[]; size: [number, number] }> => {
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
  const brickTag = materialNames.indexOf(BRICK_MATERIAL);
  const brickTexture = textures[brickTag];
  if (!brickTexture) return { bricks: [], corner: PLAN_CORNER, pockets, size: PLAN_SIZE };
  const { data, info } = brickTexture;
  const readTextureMean = (columns: [number, number], rows: [number, number]): number => {
    let sum = 0;
    for (let row = rows[0]; row < rows[1]; row++)
      for (let column = columns[0]; column < columns[1]; column++)
        sum += data[(row * info.width + column) * info.channels] ?? 0;
    return sum / ((rows[1] - rows[0]) * (columns[1] - columns[0]));
  };
  const courseLines = findProfileMinima(
    Array.from({ length: info.height }, (_, row) => readTextureMean([0, info.width], [row, row + 1])),
    JOINT_OPTIONS,
  );
  // Each course between one line and the next, wrapping round the tile, with the joints across it
  const courses = courseLines.map((top, index) => {
    const bottom = (courseLines[index + 1] ?? (courseLines[0] ?? 0) + info.height) - top;
    const inset = Math.round(bottom * COURSE_INSET_SHARE);
    const rows: [number, number] = [top + inset, Math.min(top + bottom - inset, info.height)];
    return {
      joints: findProfileMinima(
        Array.from({ length: info.width }, (_, column) => readTextureMean([column, column + 1], rows)),
        JOINT_OPTIONS,
      ),
      top,
    };
  });
  // Each brick cell labelled by its tile, its course and the joints either side of it, a brick across the tile's edge
  // Labelled as the one it continues
  const labelCellsMap = new Map<string, number[]>();
  for (let cell = 0; cell < width * height; cell++) {
    if (tags[cell] !== brickTag) continue;
    const [column, row] = readTexel(cell);
    const courseIndex = courses.findLastIndex(({ top }) => top <= row);
    const course = courses.at(courseIndex);
    if (!course) continue;
    const jointIndex = course.joints.filter((joint) => joint <= column).length;
    const isWrapped = jointIndex === course.joints.length;
    const u = Math.floor(values[cell * 2] ?? 0) + (isWrapped ? 1 : 0);
    const v = Math.floor(values[cell * 2 + 1] ?? 0);
    const key = `${u}/${v}/${courseIndex}/${isWrapped ? 0 : jointIndex}`;
    const labelCells = labelCellsMap.get(key) ?? [];
    labelCells.push(cell);
    labelCellsMap.set(key, labelCells);
  }
  const bricks = [...labelCellsMap.values()].flatMap((cells) => traceCells(cells));
  return { bricks, corner: PLAN_CORNER, pockets, size: PLAN_SIZE };
};
