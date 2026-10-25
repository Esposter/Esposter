import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";

import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";

// A strike's hitbox from its two dimensions and its offset ahead of the body. gcsim's first and fourth strikes are fans,
// A circle of radius and angle, and its second and third are boxes of width and length, each on the player
export const createBladeRollerHitbox = (
  strikeIndex: number,
  [first, second]: [number, number],
  offsetY: number,
  line: number,
): GcsimHitbox => {
  const base = {
    center: GcsimHitboxCenter.Player,
    file: "attack.go",
    line,
    name: `roller${strikeIndex + 1}`,
    offset: [0, offsetY] as [number, number],
  };
  return strikeIndex === 0 || strikeIndex === 3
    ? { ...base, fanAngle: second, radius: first, shape: GcsimHitboxShape.Circle }
    : { ...base, box: [first, second], shape: GcsimHitboxShape.Box };
};
