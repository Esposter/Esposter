type Vector = [number, number, number];
// The grid the direction is first read off, in degrees, and the number of times it is then halved about the best
const GRID_STEP = 5;
const REFINE_COUNT = 6;
// The elevations sought between, in degrees: a sun under the horizon lights nothing, and the stone is lit from the side
const MIN_ELEVATION = 0;
const MAX_ELEVATION = 80;
const toDirection = (heading: number, elevation: number): Vector => {
  const azimuth = (heading * Math.PI) / 180;
  const altitude = (elevation * Math.PI) / 180;
  return [Math.cos(altitude) * Math.sin(azimuth), Math.sin(altitude), Math.cos(altitude) * Math.cos(azimuth)];
};
// Where the sun's light falls from over faces whose brightness is known: each face's brightness regressed on how
// Squarely it meets the light (its normal's cosine to it, none when turned away) plus a constant the sky's light
// Gives every face, the direction being the one whose line fits best with the light adding brightness, read off a
// Grid of headings (degrees about +y from +z toward +x) and elevations and refined about the best. Returns the
// Direction toward the sun with the root mean square of the fit's residual, beside the median residual over the grid:
// Where the two barely differ, the faces' brightness does not depend on the direction and the solve says nothing
export const solveSunDirection = (
  samples: readonly { brightness: number; normal: Vector }[],
): { direction: Vector; elevation: number; gridResidual: number; heading: number; residual: number } => {
  const readResidual = (heading: number, elevation: number): number => {
    if (elevation < MIN_ELEVATION || elevation > MAX_ELEVATION) return Infinity;
    const [x, y, z] = toDirection(heading, elevation);
    let count = 0;
    let sumLit = 0;
    let sumBrightness = 0;
    let sumLitSquared = 0;
    let sumLitBrightness = 0;
    for (const { brightness, normal } of samples) {
      const lit = Math.max(0, normal[0] * x + normal[1] * y + normal[2] * z);
      count++;
      sumLit += lit;
      sumBrightness += brightness;
      sumLitSquared += lit * lit;
      sumLitBrightness += lit * brightness;
    }
    const variance = count * sumLitSquared - sumLit * sumLit;
    if (count === 0 || variance <= 0) return Infinity;
    const slope = (count * sumLitBrightness - sumLit * sumBrightness) / variance;
    if (slope <= 0) return Infinity;
    const intercept = (sumBrightness - slope * sumLit) / count;
    let squared = 0;
    for (const { brightness, normal } of samples) {
      const lit = Math.max(0, normal[0] * x + normal[1] * y + normal[2] * z);
      squared += (brightness - intercept - slope * lit) ** 2;
    }
    return Math.sqrt(squared / count);
  };
  let best = { elevation: 0, heading: 0, residual: Infinity };
  const gridResiduals: number[] = [];
  for (let heading = 0; heading < 360; heading += GRID_STEP)
    for (let elevation = MIN_ELEVATION; elevation <= MAX_ELEVATION; elevation += GRID_STEP) {
      const residual = readResidual(heading, elevation);
      if (Number.isFinite(residual)) gridResiduals.push(residual);
      if (residual < best.residual) best = { elevation, heading, residual };
    }
  for (let refine = 0, step = GRID_STEP / 2; refine < REFINE_COUNT; step /= 2, refine++)
    for (const [headingOffset, elevationOffset] of [
      [-step, 0],
      [step, 0],
      [0, -step],
      [0, step],
    ] as const) {
      const heading = (best.heading + headingOffset + 360) % 360;
      const elevation = best.elevation + elevationOffset;
      const residual = readResidual(heading, elevation);
      if (residual < best.residual) best = { elevation, heading, residual };
    }
  const gridResidual =
    gridResiduals.toSorted((first, second) => first - second)[Math.floor(gridResiduals.length / 2)] ?? 0;
  return { ...best, direction: toDirection(best.heading, best.elevation), gridResidual };
};
