import { toLab } from "#src/services/shared/toLab";
import { toXyz } from "#src/services/shared/toXyz";

// An albedo target's CIELab lightness per pixel, from four linear floats a pixel, as a share from 0 to 1
export const readTargetLightness = (albedo: Float32Array): Float32Array =>
  Float32Array.from(
    { length: albedo.length / 4 },
    (_lightness, pixel) =>
      toLab(toXyz([albedo[pixel * 4] ?? 0, albedo[pixel * 4 + 1] ?? 0, albedo[pixel * 4 + 2] ?? 0]))[0] / 100,
  );
