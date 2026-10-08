import type { FogUniforms } from "#src/models/post/FogUniforms";
import type { UnderwaterFogState } from "#src/models/water/UnderwaterFogState";
import type { WaterUniforms } from "#src/models/water/WaterUniforms";

// Under the water the haze is the water's own: an even fog in its colour, thick from the eye outward. Diving saves
// The fog above and surfacing gives it back, so whatever set it above, the sky or the tuning panel, keeps its values.
// The colour is written every frame under water, since the sky writes the fog's colour every frame, and so is the
// Density: one found changed from what the water last wrote was written by what sets the fog above, a weather changing,
// So it is that fog's new density, saved for surfacing
export const updateUnderwaterFog = (
  eyeHeight: number,
  {
    level,
    underwaterFogColor,
    underwaterFogDensity,
  }: Pick<WaterUniforms, "level" | "underwaterFogColor" | "underwaterFogDensity">,
  { color, density, heightFalloff, maxOpacity, startDistance }: FogUniforms,
  underwaterFogState: UnderwaterFogState,
): void => {
  const isUnderwater = eyeHeight < level.value;
  if (isUnderwater) {
    if (!underwaterFogState.isUnderwater) {
      underwaterFogState.aboveDensity = density.value;
      underwaterFogState.aboveHeightFalloff = heightFalloff.value;
      underwaterFogState.aboveMaxOpacity = maxOpacity.value;
      underwaterFogState.aboveStartDistance = startDistance.value;
      heightFalloff.value = 0;
      maxOpacity.value = 1;
      startDistance.value = 0;
    } else if (density.value !== underwaterFogState.underwaterDensity) underwaterFogState.aboveDensity = density.value;
    density.value = underwaterFogState.underwaterDensity = underwaterFogDensity.value;
    color.value.copy(underwaterFogColor.value);
  } else if (underwaterFogState.isUnderwater) {
    density.value = underwaterFogState.aboveDensity;
    heightFalloff.value = underwaterFogState.aboveHeightFalloff;
    maxOpacity.value = underwaterFogState.aboveMaxOpacity;
    startDistance.value = underwaterFogState.aboveStartDistance;
  }

  underwaterFogState.isUnderwater = isUnderwater;
};
