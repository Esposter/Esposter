import type { FogUniforms } from "#src/post/FogUniforms";
import type { UnderwaterFogState } from "#src/water/UnderwaterFogState";
import type { WaterUniforms } from "#src/water/WaterUniforms";

// Under the water the haze is the water's own: an even fog in its colour, thick from the eye outward. Diving saves
// The fog above and surfacing gives it back, so whatever set it above, the sky or the tuning panel, keeps its values.
// The colour is written every frame under water, since the sky writes the fog's colour every frame
export const updateUnderwaterFog = (
  eyeHeight: number,
  {
    level,
    underwaterFogColor,
    underwaterFogDensity,
  }: Pick<WaterUniforms, "level" | "underwaterFogColor" | "underwaterFogDensity">,
  { color, density, heightFalloff, startDistance }: FogUniforms,
  underwaterFogState: UnderwaterFogState,
): void => {
  const isUnderwater = eyeHeight < level.value;
  if (isUnderwater && !underwaterFogState.isUnderwater) {
    underwaterFogState.aboveDensity = density.value;
    underwaterFogState.aboveHeightFalloff = heightFalloff.value;
    underwaterFogState.aboveStartDistance = startDistance.value;
    density.value = underwaterFogDensity.value;
    heightFalloff.value = 0;
    startDistance.value = 0;
  } else if (!isUnderwater && underwaterFogState.isUnderwater) {
    density.value = underwaterFogState.aboveDensity;
    heightFalloff.value = underwaterFogState.aboveHeightFalloff;
    startDistance.value = underwaterFogState.aboveStartDistance;
  }

  underwaterFogState.isUnderwater = isUnderwater;
  if (isUnderwater) color.value.copy(underwaterFogColor.value);
};
