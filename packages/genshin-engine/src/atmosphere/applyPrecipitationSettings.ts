import type { PrecipitationSettings } from "#src/models/atmosphere/PrecipitationSettings";
import type { PrecipitationUniforms } from "#src/models/atmosphere/PrecipitationUniforms";

// The particles fall as the kind's settings say, written into the uniforms the one particle material reads
export const applyPrecipitationSettings = (
  { fallSpeed, length, opacity, sway, width, windDrift }: PrecipitationSettings,
  precipitationUniforms: PrecipitationUniforms,
): void => {
  precipitationUniforms.fallSpeed.value = fallSpeed;
  precipitationUniforms.length.value = length;
  precipitationUniforms.opacity.value = opacity;
  precipitationUniforms.sway.value = sway;
  precipitationUniforms.width.value = width;
  precipitationUniforms.windDrift.value = windDrift;
};
