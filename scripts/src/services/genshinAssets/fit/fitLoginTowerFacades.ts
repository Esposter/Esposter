import type { FacadeGrid } from "#src/models/genshinAssets/fit/FacadeGrid";
import type { FacadeLayer } from "#src/models/genshinAssets/fit/FacadeLayer";
import type { Texture } from "#src/models/genshinAssets/fit/Texture";
import type { TowerFacade } from "#src/models/genshinAssets/fit/TowerFacade";
import type { TowerSlab } from "#src/models/genshinAssets/fit/TowerSlab";
import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";
import type { Vector } from "#src/models/shared/Vector";

import { classifyFacadeCells } from "#src/services/genshinAssets/fit/classifyFacadeCells";
import { findCellComponents } from "#src/services/genshinAssets/fit/findCellComponents";
import { findCellRectangles } from "#src/services/genshinAssets/fit/findCellRectangles";
import { fitLatheProfile } from "#src/services/genshinAssets/fit/fitLatheProfile";
import { rasterizeTopFaces } from "#src/services/genshinAssets/fit/rasterizeTopFaces";
import { readLevelOfDetailParts } from "#src/services/genshinAssets/fit/readLevelOfDetailParts";
import { readMaterialNames } from "#src/services/genshinAssets/fit/readMaterialNames";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { sampleFacadeGrid } from "#src/services/genshinAssets/fit/sampleFacadeGrid";
import { simplifyPath } from "#src/services/genshinAssets/fit/simplifyPath";
import { toTexel } from "#src/services/genshinAssets/fit/toTexel";
import { traceCellLoops } from "#src/services/genshinAssets/fit/traceCellLoops";
import { computeUpperMedian } from "#src/services/genshinAssets/shared/computeUpperMedian";
import {
  TOWER_BAND_HEIGHT,
  TOWER_FACADE_CELL_SIZE,
  TOWER_FACADE_MIN_AREA,
  TOWER_FACADE_PAINT_CELL_SIZE,
  TOWER_FACADE_PAINT_CONTRAST,
  TOWER_FACADE_SHADE_TOLERANCE,
  TOWER_FACADE_SHALLOW_RECESS,
  TOWER_MESH_REGEX,
  TOWER_PROFILE_TOLERANCE,
  TOWER_RADIUS_TOLERANCE,
} from "#src/services/genshinAssets/shared/constants";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { BYTE } from "#src/services/shared/constants";
import { toLinear } from "#src/services/shared/toLinear";
import { existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

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
    const toRow = (cell: number): number => Math.floor(cell / width);
    // The wall's profile up the tower, row by row the median radius its faces stand at, at the row's middle,
    // Simplified into the sloped runs a moulding's roll and a cornice's overhang are, each a frustum of the lathe: what
    // Sinks in from the profile is a recess and what stands out from it a column
    const rowRadiiMap = Map.groupBy(
      [...tags.keys()].filter((cell) => (tags[cell] ?? -1) >= 0),
      (cell) => toRow(cell),
    );
    const points: [number, number][] = [];
    let rowRadius = 0;
    for (let row = 0; row < height; row++) {
      // A row the tower stands open all round keeps the wall below it
      rowRadius = computeUpperMedian((rowRadiiMap.get(row) ?? []).map((cell) => heights[cell] ?? 0)) || rowRadius;
      if (row === 0) points.push([rowRadius, 0]);
      points.push([rowRadius, (row + 0.5) * TOWER_FACADE_CELL_SIZE]);
    }
    points.push([rowRadius, height * TOWER_FACADE_CELL_SIZE]);
    const wall = simplifyPath(points, TOWER_PROFILE_TOLERANCE);
    // The profile's radius at each row's middle, between the two of its points the row stands between
    const rowWallRadii = Array.from({ length: height }, (_value, row) => {
      const y = (row + 0.5) * TOWER_FACADE_CELL_SIZE;
      const index = wall.findIndex(([, pointY]) => pointY >= y);
      const [topRadius = 0, top = 0] = wall[index] ?? [];
      const [bottomRadius = topRadius, bottom = top] = wall[index - 1] ?? [];
      return top > bottom ? bottomRadius + ((y - bottom) / (top - bottom)) * (topRadius - bottomRadius) : topRadius;
    });
    const carving: FacadeGrid = {
      cellSize: TOWER_FACADE_CELL_SIZE,
      colors,
      depths: Array.from(heights, (radius, cell) => (rowWallRadii[toRow(cell)] ?? 0) - radius),
      height,
      metals,
      tags: [...tags],
      width,
    };
    const carvingCells = classifyFacadeCells(carving);
    // What stands out from the wall or sinks deep into it as slabs over the spans it covers, each run of it joined round
    // The tower's seam and kept where it covers enough to be carving rather than a speck, then split into rectangles
    // Row by row so a rib or a window stays one tall slab and a ragged balcony keeps its outline: the wall at each and
    // How far it stands out or sinks in, the upper median over its cells
    const toSlabs = (slabCells: readonly number[], getDepth: (cell: number) => number): TowerSlab[] =>
      findCellComponents(slabCells, { isWrapped: true, width })
        .filter((component) => component.length >= TOWER_FACADE_MIN_AREA / TOWER_FACADE_CELL_SIZE ** 2)
        .flatMap((component) =>
          findCellRectangles(component, { getValue: getDepth, tolerance: TOWER_FACADE_SHALLOW_RECESS / 2, width }),
        )
        .map(({ cells: rectangleCells, columns: [firstColumn, lastColumn], rows: [firstRow, lastRow] }): TowerSlab => [
          roundFitted(computeUpperMedian(rectangleCells.map((cell) => rowWallRadii[toRow(cell)] ?? 0))),
          roundFitted(computeUpperMedian(rectangleCells.map((cell) => getDepth(cell)))),
          roundFitted(firstColumn * TOWER_FACADE_CELL_SIZE),
          roundFitted(lastColumn * TOWER_FACADE_CELL_SIZE),
          roundFitted(firstRow * TOWER_FACADE_CELL_SIZE),
          roundFitted(lastRow * TOWER_FACADE_CELL_SIZE),
        ]);
    // The paint is read on coarser cells than the carving, as fine as its loops are traced
    const paint = sampleFacadeGrid(carving, Math.round(TOWER_FACADE_PAINT_CELL_SIZE / TOWER_FACADE_CELL_SIZE));
    const paintCells = classifyFacadeCells(paint);
    const { face } = paintCells;
    const mean = computeMean(paint.colors, face);
    const bandRows = Math.max(1, Math.round(TOWER_BAND_HEIGHT / paint.cellSize));
    const toBand = (cell: number): number => Math.floor(Math.floor(cell / paint.width) / bandRows);
    const faceBandMap = Map.groupBy(face, (cell) => toBand(cell));
    // The face's tone run by run of its height, a band merged into the one below while its tone holds
    const bands: TowerFacade["bands"] = [];
    for (let band = 0; band < Math.ceil(paint.height / bandRows); band++) {
      const bandCells = faceBandMap.get(band);
      if (!bandCells) continue;
      const shade = toShade(computeMean(paint.colors, bandCells), mean);
      const from = roundFitted(band * bandRows * paint.cellSize);
      const to = roundFitted(Math.min((band + 1) * bandRows, paint.height) * paint.cellSize);
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
      const [red = 0, green = 0, blue = 0] = paint.colors[cell] ?? [];
      return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    };
    const bandLuminanceMap = new Map(
      Array.from(faceBandMap, ([band, bandCells]) => [
        band,
        bandCells.reduce((sum, cell) => sum + getLuminance(cell), 0) / bandCells.length,
      ]),
    );
    const getContrast = (cell: number): number => getLuminance(cell) / (bandLuminanceMap.get(toBand(cell)) || 1) - 1;
    const trace = (layerCells: readonly number[]): [number, number][][] =>
      traceCellLoops(layerCells, {
        cellSize: paint.cellSize,
        corner: [0, 0],
        minCells: TOWER_FACADE_MIN_AREA / paint.cellSize ** 2,
        tolerance: 1,
        width: paint.width,
      });
    const toLayer = (layerCells: readonly number[]): FacadeLayer => ({
      loops: trace(layerCells),
      shade: toShade(computeMean(paint.colors, layerCells), mean),
    });
    facades[tower] = {
      bands,
      columns: toSlabs(carvingCells.raised, (cell) => -(carving.depths[cell] ?? 0)),
      holes: trace(paint.tags.flatMap((tag, cell) => (tag < 0 ? [cell] : []))),
      layers: [
        toLayer(face.filter((cell) => getContrast(cell) < -TOWER_FACADE_PAINT_CONTRAST)),
        toLayer(face.filter((cell) => getContrast(cell) > TOWER_FACADE_PAINT_CONTRAST)),
        toLayer(paintCells.raised),
        toLayer(paintCells.shallow),
        toLayer(paintCells.deep),
        toLayer(paintCells.gilded),
      ],
      recesses: toSlabs(carvingCells.deep, (cell) => carving.depths[cell] ?? 0),
      sections: wall.slice(1).map(([topRadius, top], index) => {
        const [bottomRadius = 0, bottom = 0] = wall[index] ?? [];
        return {
          bottomRadius: roundFitted(bottomRadius),
          // Each height the gap between its two ends rounded, so the rounding never runs on up the tower
          height: roundFitted(roundFitted(top) - roundFitted(bottom)),
          topRadius: roundFitted(topRadius),
        };
      }),
      size: [roundFitted(circumference), roundFitted(towerHeight)],
    };
  }
  return facades;
};
