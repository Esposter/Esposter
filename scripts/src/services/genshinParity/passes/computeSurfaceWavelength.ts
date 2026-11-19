import { computeSurfaceLag } from "#src/services/genshinParity/passes/computeSurfaceLag";

// The dominant wavelength of a family's normal angles, in metres: the lag `computeSurfaceLag` reads, a sample being a
// Pixel of a frame or a texel of its normal map, each `metresPerSample` metres. A family whose angles resolve no lobe
// Reads none
export const computeSurfaceWavelength = ({
  angles,
  highPassRadius,
  maxLag,
  metresPerSample,
  width,
}: {
  angles: Float64Array;
  highPassRadius: number;
  maxLag: number;
  metresPerSample: number;
  width: number;
}): number | undefined => {
  const lag = computeSurfaceLag({ angles, highPassRadius, maxLag, width });
  return lag === undefined ? undefined : lag * metresPerSample;
};
