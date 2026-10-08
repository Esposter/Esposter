import type { LightUniforms } from "#src/models/nodes/LightUniforms";
import type { Node } from "three/webgpu";

import { WET_DARKENING } from "#src/nodes/constants";
import { float } from "three/tsl";

// The share of its colour a surface keeps as it wets, all of it when dry, so every surface the rain reaches darkens alike
export const createWetDarkeningNode = ({ wetness }: Pick<LightUniforms, "wetness">): Node<"float"> =>
  float(1).sub(wetness.mul(WET_DARKENING));
