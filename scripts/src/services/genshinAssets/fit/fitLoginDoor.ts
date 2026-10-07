import type { DoorRelief } from "#src/models/genshinAssets/fit/DoorRelief";
import type { LoginDoor } from "#src/models/genshinAssets/fit/LoginDoor";
import type { ReliefLayer } from "#src/models/genshinAssets/fit/ReliefLayer";
import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";
import type { DecodedClip } from "#src/models/genshinAssets/shared/DecodedClip";
import type { Vector } from "#src/models/shared/Vector";
import type { Matrix4 } from "three";

import { blurWithinTags } from "#src/services/genshinAssets/fit/blurWithinTags";
import { fitReliefLayers } from "#src/services/genshinAssets/fit/fitReliefLayers";
import { rasterizeTopFaces } from "#src/services/genshinAssets/fit/rasterizeTopFaces";
import { readLoginDoorPieces } from "#src/services/genshinAssets/fit/readLoginDoorPieces";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { toTexel } from "#src/services/genshinAssets/fit/toTexel";
import { traceCellLoops } from "#src/services/genshinAssets/fit/traceCellLoops";
import { computeOtsuThreshold } from "#src/services/genshinAssets/shared/computeOtsuThreshold";
import { GILDING_RED_BLUE_RATIO, LOGIN_DOOR_MESH } from "#src/services/genshinAssets/shared/constants";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { BYTE } from "#src/services/shared/constants";
import { toLinear } from "#src/services/shared/toLinear";
import { join } from "node:path";
import sharp from "sharp";
import { Quaternion, Vector3 } from "three";

// The door's mesh draws its frame in its first submesh and its panel in its second
const FRAME_GROUP = `${LOGIN_DOOR_MESH}_0`;
const PANEL_GROUP = `${LOGIN_DOOR_MESH}_1`;
// The texture the door's mesh paints both its parts with
const DOOR_TEXTURE = "LoginScene_Door01_Diffuse.png";
// The lift its pieces rise into place by kept every other sample, a thirtieth of a second apart, its places to the
// Millimetre and its turns to four decimals
const DOOR_LIFT_SAMPLE_STEP = 2;
const DOOR_LIFT_TURN_DECIMALS = 4;
// The door's front read on a half-centimetre grid and kept to the millimetre, its relief standing a few millimetres to
// A few centimetres out: a loop smaller than a few square centimetres dropped as a speck, each kept within a cell
const DOOR_CELL_SIZE = 0.005;
const DOOR_DECIMALS = 3;
const DOOR_MIN_CELLS = 20;
const DOOR_TOLERANCE_CELLS = 1;
// Its panel's stone blurred over the cell either side past its speckle
const RELIEF_BLUR_CELLS = 1;
// A face turned at least this far toward the front is one of the depths the door's front stands at, kept where its
// Faces at that depth cover at least so many square metres, a few square centimetres
const DOOR_FLAT_FACING = 0.98;
const DOOR_MIN_DEPTH_AREA = 0.0004;
// Two depths within a millimetre are one
const DOOR_MIN_DEPTH_STEP = 0.001;
// The door where the scene stands it, its size there, and the pieces its mesh's bones carry, each rising into place on
// Its own path through the lift clip, sampled as where it stands and how it is turned, its frame and panel each as the
// Layers its front stands out in from its middle, deepest first: every loop round what stands at least each depth out
// Seen from the front in Three's axes from the foot of its middle (an outer ring counterclockwise, a hole clockwise),
// Each sloping down to the loop below it where its faces slope (the chamfer round the frame's opening, the bevels of the
// Panel's bands) and straight elsewhere, the back the front mirrored as the game's mesh is. Its front's relief is read
// Off its texture through its own coordinates, the front drawn as the camera sees it (`rasterizeTopFaces`): the panel's
// Raised bands, its stone's lighter tone past its speckle, and the gilding of its feet, each as its loops and its colour
// Over the stone round it, inside the relief's corner and size
export const fitLoginDoor = async (
  placements: readonly AssetPlacement[],
  clips: readonly DecodedClip[],
  meshDirectory: string,
  textureDirectory: string,
): Promise<LoginDoor> => {
  const {
    duration,
    foot,
    mesh: { faceGroups, faces, faceUvs, uvs },
    piecePoses,
    placement,
    scaled,
    vertexPieces,
  } = await readLoginDoorPieces(placements, clips, meshDirectory);
  const getPiece = ([vertex = 0]: readonly number[]): number => vertexPieces[vertex] ?? 0;
  const extent = (axis: 0 | 1 | 2): number =>
    Math.max(...scaled.map((vertex) => vertex[axis])) - Math.min(...scaled.map((vertex) => vertex[axis]));
  const corner: [number, number] = [Math.min(...scaled.map(([vertexX]) => vertexX)), 0];
  const width = Math.ceil(extent(0) / DOOR_CELL_SIZE);
  const height = Math.ceil(extent(1) / DOOR_CELL_SIZE);
  const grid = {
    cellSize: DOOR_CELL_SIZE,
    corner,
    decimals: DOOR_DECIMALS,
    minCells: DOOR_MIN_CELLS,
    tolerance: DOOR_TOLERANCE_CELLS,
    width,
  };
  // Each face from the front, how far out it stands as its height, so the nearest is the one kept: a piece's frame's
  // Cells tagged twice its index and its panel's one more
  const toTag = (piece: number, group: string): number => piece * 2 + (group === PANEL_GROUP ? 1 : 0);
  const front = rasterizeTopFaces(
    faces.map((face, index) => ({
      corners: face.map((vertex) => {
        const [vertexX = 0, vertexY = 0, vertexZ = 0] = scaled[vertex] ?? [];
        return [vertexX, vertexZ, vertexY - foot] as const;
      }),
      tag: toTag(getPiece(face), faceGroups[index] ?? ""),
      values: (faceUvs[index] ?? []).map((uv) => uvs[uv] ?? [0, 0]),
    })),
    { cellSize: DOOR_CELL_SIZE, corner, height, width },
  );
  const fitRelief = async (): Promise<DoorRelief> => {
    const { values } = front;
    // The frame's cells 0 and the panel's 1, whichever piece they lie on
    const tags = Int16Array.from(front.tags, (tag) => (tag < 0 ? tag : tag % 2));
    const { data, info } = await sharp(join(textureDirectory, DOOR_TEXTURE))
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const colors = Array.from({ length: width * height }, (_value, cell): Vector => {
      const [column, row] = toTexel([values[cell * 2] ?? 0, values[cell * 2 + 1] ?? 0], info);
      const texel = (row * info.width + column) * info.channels;
      return [0, 1, 2].map((channel) => toLinear((data[texel + channel] ?? 0) / BYTE)) as Vector;
    });
    const drawn = Array.from({ length: width * height }, (_value, cell) => cell).filter(
      (cell) => (tags[cell] ?? -1) >= 0,
    );
    const computeMean = (cells: readonly number[]): Vector =>
      [0, 1, 2].map(
        (channel) => cells.reduce((sum, cell) => sum + (colors[cell]?.[channel] ?? 0), 0) / Math.max(cells.length, 1),
      ) as Vector;
    const computeShade = (cells: readonly number[], around: readonly number[]): Vector => {
      const [mean, aroundMean] = [computeMean(cells), computeMean(around)];
      return ([0, 1, 2] as const).map((channel) => roundFitted(mean[channel] / (aroundMean[channel] || 1))) as Vector;
    };
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
        loops: traceCellLoops(bands, grid),
        shade: computeShade(
          bands,
          panel.filter((cell) => !bandSet.has(cell)),
        ),
      },
      corner: [roundFitted(corner[0], DOOR_DECIMALS), corner[1]],
      gilding: {
        loops: traceCellLoops(gilded, grid),
        shade: computeShade(
          gilded,
          drawn.filter((cell) => tags[cell] === 0 && !gildedSet.has(cell)),
        ),
      },
      size: [roundFitted(width * DOOR_CELL_SIZE, DOOR_DECIMALS), roundFitted(height * DOOR_CELL_SIZE, DOOR_DECIMALS)],
    };
  };
  // A part's depths: those its faces turned to the front stand at over a few square centimetres, on whichever piece, so
  // A slope one piece carries (a chamfer, a band's bevel) steps through the depths another piece's flat faces stand at,
  // As it does over the whole door
  const findPartDepths = (group: string): number[] => {
    const depthAreaMap = new Map<number, number>();
    for (const [index, face] of faces.entries()) {
      if (faceGroups[index] !== group) continue;
      const [a, b, c] = face.map((vertex) => scaled[vertex]);
      if (!a || !b || !c) continue;
      const [ux, uy, uz] = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      const [vx, vy, vz] = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      const normal = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
      const doubleArea = Math.hypot(...normal);
      const depth = roundFitted((a[2] + b[2] + c[2]) / 3, DOOR_DECIMALS);
      if (depth <= 0 || Math.abs(normal[2] ?? 0) < DOOR_FLAT_FACING * doubleArea) continue;
      depthAreaMap.set(depth, (depthAreaMap.get(depth) ?? 0) + doubleArea / 2);
    }
    return [...depthAreaMap]
      .filter(([, area]) => area >= DOOR_MIN_DEPTH_AREA)
      .map(([depth]) => depth)
      .toSorted((firstDepth, secondDepth) => firstDepth - secondDepth);
  };
  const groupDepthsMap = new Map([FRAME_GROUP, PANEL_GROUP].map((group) => [group, findPartDepths(group)]));
  // Each part's front over every piece, which a piece finds its walls' feet over
  const groupHeightsMap = new Map(
    [FRAME_GROUP, PANEL_GROUP].map((group) => [
      group,
      front.heights.map((value, cell) => ((front.tags[cell] ?? -1) % 2 === toTag(0, group) ? value : -Infinity)),
    ]),
  );
  // A piece's part as layers at its part's depths over the least its front stands anywhere, which its slab's sides rise
  // From; a part the piece holds none of has no layers
  const fitLayers = (piece: number, group: string): ReliefLayer[] => {
    const tag = toTag(piece, group);
    if (!front.tags.includes(tag)) return [];
    const heights = front.heights.map((value, cell) => (front.tags[cell] === tag ? value : -Infinity));
    const least = roundFitted(
      heights.reduce(
        (leastHeight, value) => (Number.isFinite(value) ? Math.min(leastHeight, value) : leastHeight),
        Infinity,
      ),
      DOOR_DECIMALS,
    );
    const depths = (groupDepthsMap.get(group) ?? []).reduce(
      // oxlint-disable-next-line no-accumulating-spread -- a part keeps about a dozen depths, so the copies cost nothing
      (kept, depth) => (depth - (kept.at(-1) ?? -Infinity) < DOOR_MIN_DEPTH_STEP ? kept : [...kept, depth]),
      [least],
    );
    return fitReliefLayers(heights, depths, grid, groupHeightsMap.get(group));
  };
  const sampleCount = piecePoses[0]?.length ?? 0;
  const samples = Array.from({ length: Math.ceil((sampleCount - 1) / DOOR_LIFT_SAMPLE_STEP) + 1 }, (_value, index) =>
    Math.min(index * DOOR_LIFT_SAMPLE_STEP, sampleCount - 1),
  );
  const fitLift = (poses: readonly Matrix4[]): number[][] =>
    samples.map((sample) => {
      const [position, turn] = [new Vector3(), new Quaternion()];
      poses[sample]?.decompose(position, turn, new Vector3());
      return [
        roundFitted(position.x, DOOR_DECIMALS),
        roundFitted(position.y, DOOR_DECIMALS),
        roundFitted(position.z, DOOR_DECIMALS),
        roundFitted(turn.x, DOOR_LIFT_TURN_DECIMALS),
        roundFitted(turn.y, DOOR_LIFT_TURN_DECIMALS),
        roundFitted(turn.z, DOOR_LIFT_TURN_DECIMALS),
        roundFitted(turn.w, DOOR_LIFT_TURN_DECIMALS),
      ];
    });
  const [x = 0, y = 0, z = 0] = toRightHanded(placement.position).map((value) => roundFitted(value));
  return {
    liftRate: Math.round((sampleCount - 1) / duration / DOOR_LIFT_SAMPLE_STEP),
    pieces: piecePoses.map((poses, piece) => ({
      frame: fitLayers(piece, FRAME_GROUP),
      lift: fitLift(poses),
      panel: fitLayers(piece, PANEL_GROUP),
    })),
    position: [x, y, z],
    relief: await fitRelief(),
    size: [roundFitted(extent(0)), roundFitted(extent(1)), roundFitted(extent(2))],
  };
};
