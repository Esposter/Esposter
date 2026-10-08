import type { StoneMaterialOptions } from "#src/models/nodes/StoneMaterialOptions";
import type { Node } from "three/webgpu";

import { Color } from "three";
import { color, float, normalView, positionViewDirection, step } from "three/tsl";

// A stone's glow along its edges as the game's stone program writes it: its colour at its strength by one less the
// Facing ratio raised to its power, drawn only where its length reaches its range, every glow under it written as none
export const createStoneGlowNode = ({
  glowRange,
  rimColor,
  rimPower,
  rimStrength,
}: Pick<StoneMaterialOptions, "glowRange" | "rimColor" | "rimPower" | "rimStrength">): Node<"vec3"> => {
  const fresnel = float(1).sub(normalView.dot(positionViewDirection).saturate()).pow(rimPower).min(1);
  const glow = color(new Color().fromArray(rimColor)).mul(fresnel.mul(rimStrength));
  return glow.mul(step(glowRange, glow.length()));
};
