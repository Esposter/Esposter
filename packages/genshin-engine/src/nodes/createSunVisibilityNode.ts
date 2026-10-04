import type { Color } from "three";
import type { Node, UniformNode } from "three/webgpu";

import { LEAST_DIVISOR } from "#src/nodes/constants";
import { luminance } from "three/tsl";

// How much of the sun reaches a pixel, from none to all: the light a lighting model is handed there, already dimmed by
// The shadow, against the sun's own colour at its strength
export const createSunVisibilityNode = (lightColor: Node, sunRadiance: UniformNode<"color", Color>): Node<"float"> =>
  luminance(lightColor).div(luminance(sunRadiance).max(LEAST_DIVISOR)).saturate();
