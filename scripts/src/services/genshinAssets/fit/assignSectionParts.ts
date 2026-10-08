import { toRadialSector } from "#src/services/genshinAssets/fit/toRadialSector";

// The export part each section of a radial profile came from: over the sectors of its own height, the part reaching
// Furthest from the axis in the most sectors, a tie in sectors going to the part with the greater reach in sum. A section
// No part stands in keeps the part below it, as its radii keep the band below's. `partPoints` are each part's vertices in
// The profile's frame
export const assignSectionParts = (
  sections: readonly { height: number }[],
  { axis, foot }: { axis: readonly [number, number]; foot: number },
  angleCount: number,
  partPoints: Record<string, readonly (readonly [number, number, number])[]>,
): string[] => {
  const starts: number[] = [];
  let start = foot;
  for (const { height } of sections) {
    starts.push(start);
    start += height;
  }
  // Each section's furthest reach by each part, at each of its sectors
  const sectionReaches = sections.map(() => new Map<string, number[]>());
  for (const [part, points] of Object.entries(partPoints))
    for (const [x, y, z] of points) {
      const reaches =
        sectionReaches[
          Math.max(
            0,
            starts.findLastIndex((sectionStart) => y >= sectionStart),
          )
        ];
      if (!reaches) continue;
      const sectors = reaches.get(part) ?? Array.from({ length: angleCount }, () => 0);
      const sector = toRadialSector(x, z, axis, angleCount);
      sectors[sector] = Math.max(sectors[sector] ?? 0, Math.hypot(x - axis[0], z - axis[1]));
      reaches.set(part, sectors);
    }
  let previous = Object.keys(partPoints)[0] ?? "";
  return sectionReaches.map((reaches) => {
    const sectorCounts = new Map<string, number>();
    for (let sector = 0; sector < angleCount; sector++) {
      const [furthest] = [...reaches]
        .map(([part, sectors]): [string, number] => [part, sectors[sector] ?? 0])
        .toSorted(([, firstRadius], [, secondRadius]) => secondRadius - firstRadius);
      if (furthest && furthest[1] > 0) sectorCounts.set(furthest[0], (sectorCounts.get(furthest[0]) ?? 0) + 1);
    }
    const reachSums = new Map(
      [...reaches].map(([part, sectors]) => [part, sectors.reduce((sum, radius) => sum + radius, 0)]),
    );
    const [best] = [...sectorCounts].toSorted(
      ([firstPart, firstCount], [secondPart, secondCount]) =>
        secondCount - firstCount || (reachSums.get(secondPart) ?? 0) - (reachSums.get(firstPart) ?? 0),
    );
    previous = best?.[0] ?? previous;
    return previous;
  });
};
