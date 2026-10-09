import type { RadialProfile } from "#src/models/genshinAssets/fit/RadialProfile";

import { computeMedian } from "#src/services/genshinAssets/shared/computeMedian";

const FULL_TURN = Math.PI * 2;
// The radius of the nearest sector that holds one, so a gap in a band's sampling is read across rather than as the axis
const fillEmptySectors = (radii: readonly number[]): number[] =>
  radii.map((radius, sector) => {
    if (radius > 0) return radius;
    for (let distance = 1; distance <= radii.length; distance++) {
      const nearest = [
        radii[(sector + distance) % radii.length],
        radii[(sector - distance + radii.length) % radii.length],
      ].find((candidate) => candidate !== undefined && candidate > 0);
      if (nearest !== undefined) return nearest;
    }
    return radius;
  });
// A mesh's silhouette as a radial profile: its outermost radius about its vertical axis in each band of height and at
// Each of `angleCount` sectors about it, which is what its outline against the sky shows, then runs of bands whose radii
// Hold within a share of themselves at every sector merged into one section. The axis is the median of its bands'
// Footprints' middles, so a tower whose pivot sits off its middle keeps its own axis, and one whose brackets stand out
// To one side at a few heights is not drawn toward them. A band with no vertex lies along a straight run, so it keeps the
// Band below it
export const fitRadialProfile = (
  vertices: readonly (readonly [number, number, number])[],
  { angleCount, bandHeight, tolerance }: { angleCount: number; bandHeight: number; tolerance: number },
): RadialProfile => {
  const ys = vertices.map(([, y]) => y);
  const foot = Math.min(...ys);
  const bandCount = Math.max(1, Math.ceil((Math.max(...ys) - foot) / bandHeight));
  const bandOf = (y: number): number => Math.min(Math.floor((y - foot) / bandHeight), bandCount - 1);
  const footprints = Array.from({ length: bandCount }, () => ({
    maxX: -Infinity,
    maxZ: -Infinity,
    minX: Infinity,
    minZ: Infinity,
  }));
  for (const [x, y, z] of vertices) {
    const footprint = footprints[bandOf(y)];
    if (!footprint) continue;
    footprint.minX = Math.min(footprint.minX, x);
    footprint.maxX = Math.max(footprint.maxX, x);
    footprint.minZ = Math.min(footprint.minZ, z);
    footprint.maxZ = Math.max(footprint.maxZ, z);
  }
  const middles = footprints
    .filter(({ minX }) => minX !== Infinity)
    .map(({ maxX, maxZ, minX, minZ }) => [(minX + maxX) / 2, (minZ + maxZ) / 2] as const);
  const axis: [number, number] = [computeMedian(middles.map(([x]) => x)), computeMedian(middles.map(([, z]) => z))];
  const sampled = Array.from({ length: bandCount }, () => Array.from({ length: angleCount }, () => 0));
  for (const [x, y, z] of vertices) {
    const row = sampled[bandOf(y)];
    if (!row) continue;
    const turn = Math.round((Math.atan2(z - axis[1], x - axis[0]) / FULL_TURN) * angleCount);
    const sector = ((turn % angleCount) + angleCount) % angleCount;
    row[sector] = Math.max(row[sector] ?? 0, Math.hypot(x - axis[0], z - axis[1]));
  }
  const bands: number[][] = [];
  for (const [band, row] of sampled.entries()) {
    const isSampled = row.some((radius) => radius > 0);
    bands.push(isSampled ? fillEmptySectors(row) : (bands[band - 1] ?? row));
  }
  const sections: RadialProfile["sections"] = [];
  let start = 0;
  for (let band = 1; band <= bandCount; band++) {
    const startRadii = bands[start] ?? [];
    const bandRadii = bands[band] ?? [];
    if (
      band < bandCount &&
      bandRadii.every((radius, sector) => {
        const startRadius = startRadii[sector] ?? 0;
        return Math.abs(radius - startRadius) <= tolerance * startRadius;
      })
    )
      continue;
    sections.push({ height: (band - start) * bandHeight, radii: startRadii });
    start = band;
  }
  return { axis, foot, sections };
};
