import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";
import type { AttackArea } from "genshin-world";

import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";
import { createBoxReach } from "#src/services/genshinAssets/kits/gcsim/createBoxReach";
import { createCircleReach } from "#src/services/genshinAssets/kits/gcsim/createCircleReach";
import { createFanReach } from "#src/services/genshinAssets/kits/gcsim/createFanReach";
import { createTargetedHitArea } from "#src/services/genshinAssets/kits/gcsim/createTargetedHitArea";

// A gcsim hitbox as the area a kit prices it at, by the shared rules and the cause each carries. A box on the body is
// The circle to its far corner, and a circle on the body is its offset plus its radius (a fan takes its angle and that
// Reach). A circle on the target is the targeting area's radius plus its offset plus its radius, and a box on the
// Target is the circle round the body as long as the box. A hitbox on a place the code computes is priced as the body's,
// As the module puts the hit at that place. Only the forward offset counts: the record has no offset field, so a
// Sideways one is ignored, as a body circle's always was. A hitbox on any other centre has no area.
export const toGcsimArea = (
  { box, center, fanAngle, offset, radius, shape }: GcsimHitbox,
  targetingArea: AttackArea,
): undefined | { area: AttackArea; cause?: KitProvisionalCause } => {
  const forwardOffset = offset?.[1] ?? 0;
  const isOnBody = center === GcsimHitboxCenter.Player || center === GcsimHitboxCenter.Position;
  if (isOnBody && shape === GcsimHitboxShape.Box && box !== undefined)
    return { area: createBoxReach(forwardOffset, box[0], box[1]), cause: KitProvisionalCause.BoxAsCircle };
  else if (isOnBody && shape === GcsimHitboxShape.Circle && radius !== undefined)
    return fanAngle === undefined || fanAngle >= 360
      ? { area: createCircleReach(forwardOffset, radius) }
      : { area: createFanReach(fanAngle, forwardOffset + radius) };
  else if (center === GcsimHitboxCenter.PrimaryTarget && shape === GcsimHitboxShape.Box && box !== undefined)
    return { area: createCircleReach(0, box[1]), cause: KitProvisionalCause.TargetCentred };
  else if (center === GcsimHitboxCenter.PrimaryTarget && shape === GcsimHitboxShape.Circle && radius !== undefined)
    return {
      area: createTargetedHitArea(targetingArea, forwardOffset + radius),
      cause: KitProvisionalCause.TargetCentred,
    };
  else return undefined;
};
