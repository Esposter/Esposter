import type { StoneLight } from "#src/models/nodes/StoneLight";
import type { StoneLightUniforms } from "#src/models/nodes/StoneLightUniforms";
import type { DirectionalLight } from "three";

import { Vector3 } from "three";

// An hour's stone light written into the shared uniforms: each ramp knot into its texel, each harmonic's colour into
// Its term, the light fading with height and the haze's into their colours, and the sun light's colour at its strength, so a face's
// Shadow is read against the light as the hour set it. Called after the sky has set the sun light. Every write is to
// An existing value, so an hour passing allocates nothing
export const applyStoneLight = (
  { harmonics, hazeColor, hazeScatterColor, heightFade, ramp }: StoneLight,
  {
    harmonics: harmonicsUniform,
    hazeColor: hazeColorUniform,
    hazeScatterColor: hazeScatterColorUniform,
    heightFade: heightFadeUniform,
    ramp: rampTexture,
    sunRadiance,
  }: StoneLightUniforms,
  light: DirectionalLight,
): void => {
  const { data } = rampTexture.image;
  if (data)
    for (const [knot, [red = 0, green = 0, blue = 0]] of ramp.entries()) {
      data[knot * 4] = red;
      data[knot * 4 + 1] = green;
      data[knot * 4 + 2] = blue;
      data[knot * 4 + 3] = 1;
    }
  rampTexture.needsUpdate = true;
  for (const [term, [red = 0, green = 0, blue = 0]] of harmonics.entries()) {
    const value = harmonicsUniform.array[term];
    if (value instanceof Vector3) value.set(red, green, blue);
  }
  heightFadeUniform.value.fromArray(heightFade);
  hazeColorUniform.value.fromArray(hazeColor);
  hazeScatterColorUniform.value.fromArray(hazeScatterColor);
  sunRadiance.value.copy(light.color).multiplyScalar(light.intensity);
};
