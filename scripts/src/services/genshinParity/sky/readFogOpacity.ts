type Vector = [number, number, number];
const MIN_RAY_CLIMB = 0.000001;
// How much of a point the scene's height fog hides from the eye, as `createHeightFogNode` integrates it: a haze whose
// Density falls off exponentially with height above its base, along the ray past its start distance
export const readFogOpacity = (
  eye: Readonly<Vector>,
  point: Readonly<Vector>,
  {
    baseHeight,
    density,
    heightFalloff,
    startDistance,
  }: { baseHeight: number; density: number; heightFalloff: number; startDistance: number },
): number => {
  const ray: Vector = [point[0] - eye[0], point[1] - eye[1], point[2] - eye[2]];
  const rayLength = Math.hypot(...ray);
  if (rayLength === 0) return 0;
  const fogLength = Math.max(rayLength - startDistance, 0);
  const slope = ray[1] / rayLength;
  const startHeight = eye[1] + slope * Math.min(rayLength, startDistance);
  const densityAtStart = density * Math.exp(-(startHeight - baseHeight) * heightFalloff);
  const climb = slope * heightFalloff;
  const opticalDepth =
    Math.abs(climb) > MIN_RAY_CLIMB
      ? (densityAtStart * (1 - Math.exp(-fogLength * climb))) / climb
      : densityAtStart * fogLength;
  return 1 - Math.exp(-opticalDepth);
};
