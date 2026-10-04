import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";

import { blurWithinTags } from "#src/services/genshinAssets/fit/blurWithinTags";
import { fitSilhouette } from "#src/services/genshinAssets/fit/fitSilhouette";
import { rasterizeTopFaces } from "#src/services/genshinAssets/fit/rasterizeTopFaces";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { toTexel } from "#src/services/genshinAssets/fit/toTexel";
import { traceCellLoops } from "#src/services/genshinAssets/fit/traceCellLoops";
import { computeOtsuThreshold } from "#src/services/genshinAssets/shared/computeOtsuThreshold";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { join } from "node:path";
import sharp from "sharp";

// The door's object and the mesh it draws share this name, its frame drawn in its first submesh and its panel in its
// Second
const DOOR_MESH = "LoginScene_Door01_Vo";
const FRAME_GROUP = `${DOOR_MESH}_0`;
const PANEL_GROUP = `${DOOR_MESH}_1`;
// A part's face is traced on a two-centimetre grid and kept within a cell of it, so its diagonals run straight
const DOOR_CELL_SIZE = 0.02;
const DOOR_OUTLINE_TOLERANCE = 0.02;
// The texture the door's mesh paints both its parts with
const DOOR_TEXTURE = "LoginScene_Door01_Diffuse.png";
// The door's front read on a half-centimetre grid, its panel's stone over the cell either side past its speckle, and a
// Relief loop smaller than a few square centimetres dropped as a speck of its paint
const RELIEF_CELL_SIZE = 0.005;
const RELIEF_BLUR_CELLS = 1;
const RELIEF_MIN_CELLS = 20;
const RELIEF_TOLERANCE_CELLS = 1;
// A gilded texel's red runs past its blue by this many times, where the stone's are about equal
const GILDING_RED_BLUE_RATIO = 1.8;
const BYTE = 255;
const toLinear = (value: number): number => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
type Vector = [number, number, number];
// The door where the scene stands it, its size there, and its frame and panel each as its face seen from the front in
// Three's axes, every loop round it (an outer ring counterclockwise, a hole clockwise) from the foot of its middle,
// With the depths its front and back stand at: the frame's head and shoulders as the game's own, where a round head of
// Shares read off the capture stood in for them before. Its front's relief is read off its texture through its own
// Coordinates, the front drawn as the camera sees it (`rasterizeTopFaces`): the panel's raised bands, its stone's
// Lighter tone past its speckle, and the gilding of its feet, each as its loops and its colour over the stone round it,
// Inside the relief's corner and size
export const fitLoginDoor = async (
  placements: readonly AssetPlacement[],
  meshDirectory: string,
  textureDirectory: string,
): Promise<{
  frame: { depth: [number, number]; loops: [number, number][][] };
  panel: { depth: [number, number]; loops: [number, number][][] };
  position: [number, number, number];
  relief: {
    bands: { loops: [number, number][][]; shade: Vector };
    corner: [number, number];
    gilding: { loops: [number, number][][]; shade: Vector };
    size: [number, number];
  };
  size: [number, number, number];
}> => {
  const placement = placements.find(({ name }) => name === DOOR_MESH);
  if (!placement) throw new InvalidOperationError(Operation.Read, DOOR_MESH, "not placed in the login scene");
  const { faceGroups, faces, faceUvs, uvs, vertices } = await readObjMesh(join(meshDirectory, `${DOOR_MESH}.obj`));
  const [scale] = placement.scale;
  const scaled = vertices.map((vertex) => {
    const [x, y, z] = toRightHanded(vertex);
    return [x * scale, y * scale, z * scale] satisfies [number, number, number];
  });
  const extent = (axis: 0 | 1 | 2): number =>
    Math.max(...scaled.map((vertex) => vertex[axis])) - Math.min(...scaled.map((vertex) => vertex[axis]));
  const foot = Math.min(...scaled.map(([, y]) => y));
  const toFront = (index: number): [number, number] => {
    const [x = 0, y = 0] = scaled[index] ?? [];
    return [x, y - foot];
  };
  const fitRelief = async (): Promise<Awaited<ReturnType<typeof fitLoginDoor>>["relief"]> => {
    const corner: [number, number] = [Math.min(...scaled.map(([vertexX]) => vertexX)), 0];
    const width = Math.ceil(extent(0) / RELIEF_CELL_SIZE);
    const height = Math.ceil(extent(1) / RELIEF_CELL_SIZE);
    // Each face from the front, its depth toward the camera standing as its height, so the nearest is the one kept
    const { tags, values } = rasterizeTopFaces(
      faces.map((face, index) => ({
        corners: face.map((vertex) => {
          const [vertexX = 0, vertexY = 0, vertexZ = 0] = scaled[vertex] ?? [];
          return [vertexX, vertexZ, vertexY - foot] as const;
        }),
        tag: faceGroups[index] === PANEL_GROUP ? 1 : 0,
        values: (faceUvs[index] ?? []).map((uv) => uvs[uv] ?? [0, 0]),
      })),
      { cellSize: RELIEF_CELL_SIZE, corner, height, width },
    );
    const { data, info } = await sharp(join(textureDirectory, DOOR_TEXTURE))
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const colors = Array.from({ length: width * height }, (_, cell): Vector => {
      const [column, row] = toTexel([values[cell * 2] ?? 0, values[cell * 2 + 1] ?? 0], info);
      const texel = (row * info.width + column) * info.channels;
      return [0, 1, 2].map((channel) => toLinear((data[texel + channel] ?? 0) / BYTE)) as Vector;
    });
    const drawn = Array.from({ length: width * height }, (_, cell) => cell).filter((cell) => (tags[cell] ?? -1) >= 0);
    const computeMean = (cells: readonly number[]): Vector =>
      [0, 1, 2].map(
        (channel) => cells.reduce((sum, cell) => sum + (colors[cell]?.[channel] ?? 0), 0) / Math.max(cells.length, 1),
      ) as Vector;
    const computeShade = (cells: readonly number[], around: readonly number[]): Vector => {
      const [mean, aroundMean] = [computeMean(cells), computeMean(around)];
      return ([0, 1, 2] as const).map((channel) => roundFitted(mean[channel] / (aroundMean[channel] || 1))) as Vector;
    };
    const traceCells = (cells: readonly number[]): [number, number][][] =>
      traceCellLoops(cells, {
        cellSize: RELIEF_CELL_SIZE,
        corner,
        minCells: RELIEF_MIN_CELLS,
        tolerance: RELIEF_TOLERANCE_CELLS,
        width,
      });
    const checkIsGilded = (cell: number): boolean => {
      const [red = 0, , blue = 0] = colors[cell] ?? [];
      return red > blue * GILDING_RED_BLUE_RATIO;
    };
    const gilded = drawn.filter((cell) => checkIsGilded(cell));
    const panel = drawn.filter((cell) => tags[cell] === 1 && !checkIsGilded(cell));
    const grey = Float32Array.from(colors, ([red, green, blue]) => (red + green + blue) / 3);
    const blurred = blurWithinTags(grey, tags, { height, radius: RELIEF_BLUR_CELLS, width });
    const threshold = computeOtsuThreshold(panel.map((cell) => (blurred[cell] ?? 0) * BYTE));
    const bands = panel.filter((cell) => (blurred[cell] ?? 0) * BYTE > threshold);
    const bandSet = new Set(bands);
    const gildedSet = new Set(gilded);
    return {
      bands: {
        loops: traceCells(bands),
        shade: computeShade(
          bands,
          panel.filter((cell) => !bandSet.has(cell)),
        ),
      },
      corner: [roundFitted(corner[0]), corner[1]],
      gilding: {
        loops: traceCells(gilded),
        shade: computeShade(
          gilded,
          drawn.filter((cell) => tags[cell] === 0 && !gildedSet.has(cell)),
        ),
      },
      size: [roundFitted(width * RELIEF_CELL_SIZE), roundFitted(height * RELIEF_CELL_SIZE)],
    };
  };
  const fitPart = (group: string): { depth: [number, number]; loops: [number, number][][] } => {
    const partFaces = faces.filter((_, index) => faceGroups[index] === group);
    const depths = partFaces.flatMap((face) => face.map((index) => scaled[index]?.[2] ?? 0));
    const triangles = partFaces.map(([a, b, c]) => [toFront(a), toFront(b), toFront(c)] as const);
    return {
      depth: [roundFitted(Math.min(...depths)), roundFitted(Math.max(...depths))],
      loops: fitSilhouette(triangles, { cellSize: DOOR_CELL_SIZE, tolerance: DOOR_OUTLINE_TOLERANCE }).map((loop) =>
        loop.map(([x, y]): [number, number] => [roundFitted(x), roundFitted(y)]),
      ),
    };
  };
  const [x = 0, y = 0, z = 0] = toRightHanded(placement.position).map((value) => roundFitted(value));
  return {
    frame: fitPart(FRAME_GROUP),
    panel: fitPart(PANEL_GROUP),
    position: [x, y, z],
    relief: await fitRelief(),
    size: [roundFitted(extent(0)), roundFitted(extent(1)), roundFitted(extent(2))],
  };
};
