import type { SceneLayout } from "genshin-engine";

import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { SURFACE_HIGH_PASS_RADIUS_PIXELS, SURFACE_LAG_CAP_SHARE } from "#src/services/genshinParity/passes/constants";
import { computeMetresPerUv } from "#src/services/genshinParity/passes/computeMetresPerUv";
import { computeSurfaceWavelength } from "#src/services/genshinParity/passes/computeSurfaceWavelength";
import { existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

type Vec2 = [number, number];
type Vec3 = [number, number, number];

// The slot a stone material's normal map is bound to, as the game's shader names it and the layout keeps it
const NORMAL_MAP_PROPERTY = "_BumpMap";

const subtract = ([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): Vec3 => [ax - bx, ay - by, az - bz];
const cross = ([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): Vec3 => [
  ay * bz - az * by,
  az * bx - ax * bz,
  ax * by - ay * bx,
];
const getLength = ([x, y, z]: Vec3): number => Math.hypot(x, y, z);
// The signed area of the parallelogram an edge and a point span, positive on one side of the edge and negative on the other
const getEdgeSide = ([ax, ay]: Vec2, [bx, by]: Vec2, [px, py]: Vec2): number =>
  (bx - ax) * (py - ay) - (by - ay) * (px - ax);
// A texel's tilt from the flat, in degrees, from the three channels its RGB encodes its normal's vector in
const getTiltDegrees = (data: Buffer, texel: number, channels: number): number => {
  const [x = 0, y = 0, z = 0] = [0, 1, 2].map((channel) => ((data[texel * channels + channel] ?? 0) / 255) * 2 - 1);
  return (Math.atan2(Math.hypot(x, y), z) * 180) / Math.PI;
};
// Marks the texels a UV triangle covers. Its corners are in UV space, V up, and a texture's rows run from the top
const markCoverage = (coverage: Uint8Array, width: number, height: number, corners: readonly Vec2[]): void => {
  const [first, second, third] = corners.map(([u, v]): Vec2 => [u * width, (1 - v) * height]);
  if (!first || !second || !third) return;
  if (getEdgeSide(first, second, third) === 0) return;
  const columns = [first[0], second[0], third[0]];
  const rows = [first[1], second[1], third[1]];
  const [minRow, maxRow] = [
    Math.max(0, Math.floor(Math.min(...rows))),
    Math.min(height - 1, Math.ceil(Math.max(...rows))),
  ];
  const [minColumn, maxColumn] = [
    Math.max(0, Math.floor(Math.min(...columns))),
    Math.min(width - 1, Math.ceil(Math.max(...columns))),
  ];
  for (let row = minRow; row <= maxRow; row++)
    for (let column = minColumn; column <= maxColumn; column++) {
      const point: Vec2 = [column + 0.5, row + 0.5];
      const sides = [
        getEdgeSide(first, second, point),
        getEdgeSide(second, third, point),
        getEdgeSide(third, first, point),
      ];
      if (sides.every((side) => side >= 0) || sides.every((side) => side <= 0)) coverage[row * width + column] = 1;
    }
};
// Each of a family's triangles, in its mesh's own units scaled to where the placement puts them, with its UV area and
// Its corners' UVs, for `computeMetresPerUv` and the coverage of the map
const readFamilyTriangles = async (
  assets: string,
  placements: SceneLayout["placements"],
): Promise<{ corners: Vec2[]; triangle: { uvArea: number; worldArea: number } }[]> => {
  const meshes = await Promise.all(
    placements.map(async ({ mesh, scale }) => ({
      mesh,
      scale,
      ...(await readObjMesh(join(assets, "Mesh", `${mesh}.obj`))),
    })),
  );
  return meshes.flatMap(({ faceUvs, faces, scale, uvs, vertices }) => {
    const world = vertices.map(([x, y, z]): Vec3 => [x * scale[0], y * scale[1], z * scale[2]]);
    return faces.flatMap(([a, b, c], face): { corners: Vec2[]; triangle: { uvArea: number; worldArea: number } }[] => {
      const [first, second, third] = [a, b, c].map((index): Vec3 => world[index] ?? [0, 0, 0]);
      const corners = (faceUvs[face] ?? [0, 0, 0]).map((index): Vec2 => uvs[index] ?? [0, 0]);
      const [uvFirst, uvSecond, uvThird] = corners;
      if (!first || !second || !third || !uvFirst || !uvSecond || !uvThird) return [];
      const worldArea = getLength(cross(subtract(second, first), subtract(third, first))) / 2;
      const uvArea = Math.abs(getEdgeSide(uvFirst, uvSecond, uvThird)) / 2;
      return [{ corners, triangle: { uvArea, worldArea } }];
    });
  });
};
// The dominant wavelength of a family's normal detail read off its exported normal map, in metres, for a family whose
// Frame resolves no lobe. The map's tilt angles are read over the texels the family's UV triangles cover, the lobe is
// Found as the frame's is (`computeSurfaceWavelength`), and a texel spans the family's metres per UV unit over the map's
// Width (`computeMetresPerUv`). A family's map is the one its materials reference most, since a triangle does not name the
// Material it is drawn with. None where the family's meshes or map are not exported
export const readTextureWavelength = async ({
  assets,
  checkIsFamilyMesh,
  layout,
}: {
  assets: string;
  checkIsFamilyMesh: (mesh: string) => boolean;
  layout: SceneLayout;
}): Promise<number | undefined> => {
  const placements = layout.placements.filter(
    ({ mesh }) => checkIsFamilyMesh(mesh) && existsSync(join(assets, "Mesh", `${mesh}.obj`)),
  );
  const mapCounts = new Map<string, number>();
  for (const { materials } of placements)
    for (const material of materials) {
      const name = layout.materials[material]?.textures[NORMAL_MAP_PROPERTY]?.name;
      if (name !== undefined) mapCounts.set(name, (mapCounts.get(name) ?? 0) + 1);
    }
  const [mapName] = [...mapCounts.entries()].toSorted(([, first], [, second]) => second - first)[0] ?? [];
  if (mapName === undefined) return undefined;
  const triangles = await readFamilyTriangles(assets, placements);
  const metresPerUv = computeMetresPerUv(triangles.map(({ triangle }) => triangle));
  if (metresPerUv === undefined) return undefined;
  const { data, info } = await sharp(join(assets, "Texture2D", `${mapName}.png`))
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { channels, height, width } = info;
  const coverage = new Uint8Array(width * height);
  for (const { corners } of triangles) markCoverage(coverage, width, height, corners);
  const angles = Float64Array.from({ length: width * height }, (_value, texel) =>
    coverage[texel] ? getTiltDegrees(data, texel, channels) : Number.NaN,
  );
  const us = triangles.flatMap(({ corners }) => corners.map(([u]) => u));
  return computeSurfaceWavelength({
    angles,
    // The frame's own box, in texels: a map's tilt varies at its texels, and this is the box the frame's lobe is read through
    highPassRadius: SURFACE_HIGH_PASS_RADIUS_PIXELS,
    maxLag: Math.floor((Math.max(...us) - Math.min(...us)) * width * SURFACE_LAG_CAP_SHARE),
    metresPerSample: metresPerUv / width,
    width,
  });
};
