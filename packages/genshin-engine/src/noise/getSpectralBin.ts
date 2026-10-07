import { SPECTRAL_ANGULAR_BIN_COUNT, SPECTRAL_RADIAL_BIN_COUNT } from "#src/noise/constants";

// The bin of a texture's spectrum a frequency falls in, by its radius's band and its direction's sector
// (`SPECTRAL_RADIAL_BIN_COUNT`, `SPECTRAL_ANGULAR_BIN_COUNT`), the frequency given as its index across and down the
// Texture's transform, each past half the texture standing for the negative frequency it wraps to; the mean, which no
// Bin holds, is none
export const getSpectralBin = (column: number, row: number, width: number, height: number): number | undefined => {
  const across = (column > width / 2 ? column - width : column) / width;
  const down = (row > height / 2 ? row - height : row) / height;
  const radius = Math.hypot(across, down);
  if (radius === 0) return undefined;
  const [least, most] = [Math.log2(1 / Math.max(width, height)), Math.log2(Math.SQRT1_2)];
  const radial = Math.min(
    Math.max(Math.floor(((Math.log2(radius) - least) / (most - least)) * SPECTRAL_RADIAL_BIN_COUNT), 0),
    SPECTRAL_RADIAL_BIN_COUNT - 1,
  );
  const angle = (Math.atan2(down, across) + Math.PI) % Math.PI;
  const angular = Math.min(Math.floor((angle / Math.PI) * SPECTRAL_ANGULAR_BIN_COUNT), SPECTRAL_ANGULAR_BIN_COUNT - 1);
  return radial * SPECTRAL_ANGULAR_BIN_COUNT + angular;
};
