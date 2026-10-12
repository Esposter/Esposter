import type { Node } from "three/webgpu";

import { DESATURATION_WEIGHTS } from "#src/character/shading/constants";
import { dot, float, mix, vec3 } from "three/tsl";

// The TSL form of getToneColour: the colour drawn toward its luminance by the desaturation scale, then pushed away from
// Mid grey by one plus the contrast scale
export const createToneNode = (colour: Node<"vec3">, desaturateScale: number, contrastScale: number): Node<"vec3"> => {
  const [weightRed, weightGreen, weightBlue] = DESATURATION_WEIGHTS;
  const luminance = dot(colour, vec3(weightRed, weightGreen, weightBlue));
  const desaturated = mix(colour, vec3(luminance), desaturateScale);
  return vec3(0.5).add(desaturated.sub(0.5).mul(float(1).add(contrastScale)));
};
