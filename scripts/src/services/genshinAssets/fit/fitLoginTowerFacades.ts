import type { LatheProfile } from "#src/models/genshinAssets/fit/LatheProfile";
import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";

import { fitLatheProfile } from "#src/services/genshinAssets/fit/fitLatheProfile";
import { rasterizeTopFaces } from "#src/services/genshinAssets/fit/rasterizeTopFaces";
import { readLevelOfDetailParts } from "#src/services/genshinAssets/fit/readLevelOfDetailParts";
import { readMaterialNames } from "#src/services/genshinAssets/fit/readMaterialNames";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { toTexel } from "#src/services/genshinAssets/fit/toTexel";
import { traceCellLoops } from "#src/services/genshinAssets/fit/traceCellLoops";
import {
  TOWER_BAND_HEIGHT,
  TOWER_FACADE_CELL_SIZE,
  TOWER_FACADE_DEEP_RECESS,
  TOWER_FACADE_MIN_CELLS,
  TOWER_FACADE_PAINT_CONTRAST,
  TOWER_FACADE_SHADE_TOLERANCE,
  TOWER_FACADE_SHALLOW_RECESS,
  TOWER_MESH_REGEX,
  TOWER_RADIUS_TOLERANCE,
} from "#src/services/genshinAssets/shared/constants";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

export interface TowerFacade {
  // The tone of each run of the tower's height, from its foot, as a share of the tower's own mean stone
  bands: { from: number; shade: Vector; to: number }[];
  // Where the tower is open, so the sky shows through between its columns
  holes: [number, number][][];
  // The paint on its face darker and lighter than its band, what stands out from its wall, its recesses shallow and
  // Then deep, and its gilding, each
  // As loops in its own shade over the band under it, drawn in that order
  layers: FacadeLayer[];
  // The lathe the scene builds it as: its walls' radius band by band, a band merged into the one below while its radius
  // Holds within the tolerance, so its facade lies on the face it was read off rather than out on its columns' and
  // Its cornices' tips
  sections: LatheProfile["sections"];
  // Its surface's breadth round at its widest and its height, the loops' frame, in its mesh's own units
  size: [number, number];
}
interface FacadeLayer {
  // How far in from its band's wall it stands, in its mesh's units, out where it is less than none, and nothing for paint
  depth: number;
  loops: [number, number][][];
  shade: Vector;
}
interface Texture {
  data: Buffer;
  info: { channels: number; height: number; width: number };
}
type Vector = [number, number, number];
const BYTE = 255;
// A texel's metal reads in its mask's green channel, and a gilded texel's red runs past its blue by this many times
const METAL_THRESHOLD = 0.5;
const GILDING_RED_BLUE_RATIO = 1.8;
const toLinear = (value: number): number => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
const readTexture = (path: string): Promise<Texture | undefined> =>
  existsSync(path) ? sharp(path).raw().toBuffer({ resolveWithObject: true }) : Promise.resolve(undefined);
const getTexel = ({ data, info }: Texture, uv: readonly [number, number], channel: number): number => {
  const [column, row] = toTexel(uv, info);
  return (data[(row * info.width + column) * info.channels + channel] ?? 0) / BYTE;
};
const computeMean = (colors: readonly Vector[], cells: readonly number[]): Vector =>
  ([0, 1, 2] as const).map(
    (channel) => cells.reduce((sum, cell) => sum + (colors[cell]?.[channel] ?? 0), 0) / Math.max(cells.length, 1),
  ) as Vector;
const toShade = (mean: Vector, base: Vector): Vector =>
  ([0, 1, 2] as const).map((channel) => roundFitted(mean[channel] / (base[channel] || 1))) as Vector;
// Each login tower's surface as the game paints and carves it, read off its finest mesh unrolled round its own axis,
// The way the scene's lathe stands it: each cell of the unrolled surface keeps the face standing farthest out over it,
// Its material's diffuse colour and metal there, and how far in from its band's wall it stands. What the lathe
// Cannot carve is drawn on it instead: the tone of each run of its height, its recesses (the fluting, the windows and
// The arches) at two depths and its gilding, each traced as loops in its own shade, and where it stands open. Only the
// Loops and the shades ship, never a texel of the game's
export const fitLoginTowerFacades = async (
  placements: readonly AssetPlacement[],
  meshDirectory: string,
  textureDirectory: string,
): Promise<Record<string, TowerFacade>> => {
  const { meshPathMap, partPlacements } = readLevelOfDetailParts(placements, TOWER_MESH_REGEX, meshDirectory);
  const pathIdNameMap = await readMaterialNames(partPlacements);
  const facades: Record<string, TowerFacade> = {};
  for (const [tower, meshPath] of meshPathMap) {
    const placement = partPlacements.find(({ mesh, part }) => part === tower && meshPath.endsWith(`${mesh}.obj`));
    const materialNames = (placement?.materials ?? []).map((pathId) => pathIdNameMap.get(pathId) ?? "");
    // oxlint-disable-next-line no-await-in-loop -- one tower's textures are read at a time
    const materialTextures = await Promise.all(
      materialNames.map(async (name) => ({
        diffuse: await readTexture(join(textureDirectory, `${name}_Diffuse.png`)),
        mask: await readTexture(join(textureDirectory, `${name}_SMBE.png`)),
      })),
    );
    // oxlint-disable-next-line no-await-in-loop -- one mesh of tens of thousands of vertices is read at a time
    const { faceGroups, faces, faceUvs, uvs, vertices } = await readObjMesh(meshPath);
    const profile = fitLatheProfile(vertices, { bandHeight: TOWER_BAND_HEIGHT, tolerance: TOWER_RADIUS_TOLERANCE });
    const [axisX, axisZ] = profile.axis;
    const maxRadius = Math.max(...profile.sections.map(({ bottomRadius }) => bottomRadius));
    const towerHeight = profile.sections.reduce((sum, { height }) => sum + height, 0);
    const circumference = 2 * Math.PI * maxRadius;
    const width = Math.ceil(circumference / TOWER_FACADE_CELL_SIZE);
    const height = Math.ceil(towerHeight / TOWER_FACADE_CELL_SIZE);
    const groups = [...new Set(faceGroups)];
    // Round the axis as three's lathe turns, its angle from +z toward +x in three's axes, the game's z mirrored
    const { heights, tags, values } = rasterizeTopFaces(
      faces.flatMap((face, index) => {
        const points = face.map((vertex) => {
          const [x = 0, y = 0, z = 0] = vertices[vertex] ?? [];
          const [offsetX, offsetZ] = [x - axisX, -(z - axisZ)];
          const angle = Math.atan2(offsetX, offsetZ);
          return {
            radius: Math.hypot(offsetX, offsetZ),
            turn: angle / (2 * Math.PI) + (angle < 0 ? 1 : 0),
            y: y - profile.foot,
          };
        });
        const turns = points.map(({ turn }) => turn);
        // A face across the seam is drawn on both its sides, its turns taken past one or short of none
        const isAcrossSeam = Math.max(...turns) - Math.min(...turns) > 0.5;
        const shifts = isAcrossSeam ? [0, -1] : [0];
        return shifts.map((shift) => ({
          corners: points.map(
            ({ radius, turn, y }) =>
              [(isAcrossSeam && turn < 0.5 ? turn + 1 + shift : turn + shift) * circumference, radius, y] as const,
          ),
          tag: groups.indexOf(faceGroups[index] ?? ""),
          values: (faceUvs[index] ?? []).map((uv) => uvs[uv] ?? [0, 0]),
        }));
      }),
      { cellSize: TOWER_FACADE_CELL_SIZE, corner: [0, 0], height, width },
    );
    const colors: Vector[] = [];
    const metals: number[] = [];
    const depths: number[] = [];
    for (let cell = 0; cell < width * height; cell++) {
      const tag = tags[cell] ?? -1;
      const textures = materialTextures[Number(/_(?<index>\d+)$/u.exec(groups[tag] ?? "")?.groups?.index ?? -1)];
      const uv: [number, number] = [values[cell * 2] ?? 0, values[cell * 2 + 1] ?? 0];
      const diffuse = textures?.diffuse;
      colors.push(
        diffuse ? ([0, 1, 2].map((channel) => toLinear(getTexel(diffuse, uv, channel))) as Vector) : [0, 0, 0],
      );
      metals.push(textures?.mask ? getTexel(textures.mask, uv, 1) : 0);
    }
    const cells = Array.from({ length: width * height }, (_, cell) => cell);
    const drawn = cells.filter((cell) => (tags[cell] ?? -1) >= 0);
    // Each band's wall stands at the median radius its faces stand at, which a recess sinks into and a column or a
    // Moulding stands out from
    const bandRows = Math.max(1, Math.round(TOWER_BAND_HEIGHT / TOWER_FACADE_CELL_SIZE));
    const toBand = (cell: number): number => Math.floor(Math.floor(cell / width) / bandRows);
    const bandRadii = new Map<number, number[]>();
    for (const cell of drawn) {
      const band = toBand(cell);
      const radii = bandRadii.get(band) ?? [];
      radii.push(heights[cell] ?? 0);
      bandRadii.set(band, radii);
    }
    const wallRadii = new Map(
      Array.from(bandRadii, ([band, radii]) => [
        band,
        radii.toSorted((first, second) => first - second)[Math.floor(radii.length / 2)] ?? 0,
      ]),
    );
    for (const cell of cells) depths.push((wallRadii.get(toBand(cell)) ?? 0) - (heights[cell] ?? 0));
    const bandCount = Math.ceil(height / bandRows);
    const toWallSections = (): LatheProfile["sections"] => {
      const sections: LatheProfile["sections"] = [];
      let radius = 0;
      for (let band = 0; band < bandCount; band++) {
        // A band the tower stands open all round keeps the wall below it
        radius = wallRadii.get(band) || radius;
        const bandHeight = (Math.min((band + 1) * bandRows, height) - band * bandRows) * TOWER_FACADE_CELL_SIZE;
        const last = sections.at(-1);
        if (last && Math.abs(radius - last.bottomRadius) <= TOWER_RADIUS_TOLERANCE * last.bottomRadius)
          last.height = roundFitted(last.height + bandHeight);
        else
          sections.push({
            bottomRadius: roundFitted(radius),
            height: roundFitted(bandHeight),
            topRadius: roundFitted(radius),
          });
      }
      return sections;
    };
    const checkIsGilded = (cell: number): boolean => {
      const [red = 0, , blue = 0] = colors[cell] ?? [];
      return (metals[cell] ?? 0) >= METAL_THRESHOLD || red > blue * GILDING_RED_BLUE_RATIO;
    };
    const gilded = drawn.filter((cell) => checkIsGilded(cell));
    const stone = drawn.filter((cell) => !checkIsGilded(cell));
    const deep = stone.filter((cell) => (depths[cell] ?? 0) >= TOWER_FACADE_DEEP_RECESS);
    const shallow = stone.filter(
      (cell) => (depths[cell] ?? 0) >= TOWER_FACADE_SHALLOW_RECESS && (depths[cell] ?? 0) < TOWER_FACADE_DEEP_RECESS,
    );
    const raised = stone.filter((cell) => (depths[cell] ?? 0) <= -TOWER_FACADE_SHALLOW_RECESS);
    const face = stone.filter((cell) => Math.abs(depths[cell] ?? 0) < TOWER_FACADE_SHALLOW_RECESS);
    const mean = computeMean(colors, face);
    const faceBandMap = Map.groupBy(face, (cell) => toBand(cell));
    // The face's tone run by run of its height, a band merged into the one below while its tone holds
    const bands: TowerFacade["bands"] = [];
    for (let band = 0; band < bandCount; band++) {
      const bandCells = faceBandMap.get(band);
      if (!bandCells) continue;
      const shade = toShade(computeMean(colors, bandCells), mean);
      const from = roundFitted(band * bandRows * TOWER_FACADE_CELL_SIZE);
      const to = roundFitted(Math.min((band + 1) * bandRows, height) * TOWER_FACADE_CELL_SIZE);
      const last = bands.at(-1);
      if (
        last &&
        shade.every((channel, index) => Math.abs(channel - (last.shade[index] ?? 0)) <= TOWER_FACADE_SHADE_TOLERANCE)
      )
        last.to = to;
      else bands.push({ from, shade, to });
    }
    // The paint on the face: a cell darker or lighter than its band's mean by the paint's contrast
    const getLuminance = (cell: number): number => {
      const [red = 0, green = 0, blue = 0] = colors[cell] ?? [];
      return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    };
    const bandLuminanceMap = new Map(
      Array.from(faceBandMap, ([band, bandCells]) => [
        band,
        bandCells.reduce((sum, cell) => sum + getLuminance(cell), 0) / bandCells.length,
      ]),
    );
    const getContrast = (cell: number): number => getLuminance(cell) / (bandLuminanceMap.get(toBand(cell)) || 1) - 1;
    const darkPaint = face.filter((cell) => getContrast(cell) < -TOWER_FACADE_PAINT_CONTRAST);
    const lightPaint = face.filter((cell) => getContrast(cell) > TOWER_FACADE_PAINT_CONTRAST);
    const trace = (layerCells: readonly number[]): [number, number][][] =>
      traceCellLoops(layerCells, {
        cellSize: TOWER_FACADE_CELL_SIZE,
        corner: [0, 0],
        minCells: TOWER_FACADE_MIN_CELLS,
        tolerance: 1,
        width,
      });
    const toLayer = (layerCells: readonly number[], depth: number): FacadeLayer => ({
      depth,
      loops: trace(layerCells),
      shade: toShade(computeMean(colors, layerCells), mean),
    });
    facades[tower] = {
      bands,
      holes: trace(cells.filter((cell) => (tags[cell] ?? -1) < 0)),
      layers: [
        toLayer(darkPaint, 0),
        toLayer(lightPaint, 0),
        toLayer(raised, -TOWER_FACADE_SHALLOW_RECESS),
        toLayer(shallow, TOWER_FACADE_SHALLOW_RECESS),
        toLayer(deep, TOWER_FACADE_DEEP_RECESS),
        toLayer(gilded, 0),
      ],
      sections: toWallSections(),
      size: [roundFitted(circumference), roundFitted(towerHeight)],
    };
  }
  return facades;
};
