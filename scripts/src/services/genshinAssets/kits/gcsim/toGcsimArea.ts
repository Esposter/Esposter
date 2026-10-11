import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";
import type { AttackArea } from "genshin-world";

import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { createBoxReach, createCircleReach, createFanReach, createTargetedHitArea } from "genshin-world";

// A gcsim hitbox as the area a kit prices it at, by the shared rules and the cause each carries: a box round the body
// As the circle to its far corner, a circle round the body as its offset plus its radius, a fan as its angle and that
// Reach, and a circle on the target as the circle round the body to the targeting zone's edge plus its radius. A
// Hitbox on any other centre, or of another shape, has no area
export const toGcsimArea = (
  { box, center, fanAngle, offset, radius, shape }: GcsimHitbox,
  targetingArea: AttackArea,
): undefined | { area: AttackArea; cause?: KitProvisionalCause } => {
  const forwardOffset = offset?.[1] ?? 0;
  if (center === GcsimHitboxCenter.Player) {
    if (shape === GcsimHitboxShape.Box && box !== undefined)
      return { area: createBoxReach(forwardOffset, box[0], box[1]), cause: KitProvisionalCause.BoxAsCircle };
    else if (shape === GcsimHitboxShape.Circle && radius !== undefined)
      return fanAngle === undefined || fanAngle >= 360
        ? { area: createCircleReach(forwardOffset, radius) }
        : { area: createFanReach(fanAngle, forwardOffset + radius) };
  } else if (center === GcsimHitboxCenter.PrimaryTarget && shape === GcsimHitboxShape.Circle && radius !== undefined)
    return { area: createTargetedHitArea(targetingArea, radius), cause: KitProvisionalCause.TargetCentred };
  return undefined;
};
