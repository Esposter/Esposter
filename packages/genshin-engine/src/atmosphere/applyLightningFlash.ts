import type { SkyUniforms } from "#src/models/atmosphere/SkyUniforms";
import type { Color, HemisphereLight } from "three";

import { LIGHTNING_FLASH_AMBIENT, LIGHTNING_FLASH_SKY } from "#src/atmosphere/constants";

// A strike's flash over the sky the clock has just written: the sky's colours, front and back, and its clouds' turned
// Toward the flash's scene colour, and the ambient light raised, each by the flash's brightness. Written after the sky
// Every frame of the flash, so the sky comes back of itself as the flash dies
export const applyLightningFlash = (
  flash: number,
  flashColor: Color,
  skyUniforms: SkyUniforms,
  hemisphere: HemisphereLight,
): void => {
  const amount = Math.min(flash, 1) * LIGHTNING_FLASH_SKY;
  skyUniforms.cloudLitBackColor.value.lerp(flashColor, amount);
  skyUniforms.cloudLitColor.value.lerp(flashColor, amount);
  skyUniforms.cloudShadeBackColor.value.lerp(flashColor, amount);
  skyUniforms.cloudShadeColor.value.lerp(flashColor, amount);
  skyUniforms.horizonBackColor.value.lerp(flashColor, amount);
  skyUniforms.horizonColor.value.lerp(flashColor, amount);
  skyUniforms.zenithBackColor.value.lerp(flashColor, amount);
  skyUniforms.zenithColor.value.lerp(flashColor, amount);
  hemisphere.intensity += flash * LIGHTNING_FLASH_AMBIENT;
};
