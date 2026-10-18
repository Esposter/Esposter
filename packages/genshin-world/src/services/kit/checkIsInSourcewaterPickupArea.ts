import type { KitBody } from "#src/models/kit/KitBody";
import type { GroundPoint } from "genshin-engine";

import { computeFacingAngle } from "#src/services/kit/computeFacingAngle";

// Measured: gcsim v2.47.2 (MIT) neuvillette/charge.go, getSourcewaterDroplets: a box seven metres behind the body to eleven
// Ahead and four metres to either side, or a fan of fourteen metres spanning eighty degrees ahead. A droplet is a point,
// So the box and the fan are tested on its centre alone
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/neuvillette/charge.go
const BOX_BEHIND_METRES = 7;
const BOX_AHEAD_METRES = 11;
const BOX_HALF_WIDTH_METRES = 4;
const FAN_RADIUS_METRES = 14;
const FAN_ANGLE = (80 * Math.PI) / 180;

export const checkIsInSourcewaterPickupArea = (body: KitBody, centre: GroundPoint): boolean => {
  const { facing, position } = body;
  const dx = centre.x - position.x;
  const dz = centre.z - position.z;
  const forward = -(dx * Math.sin(facing) + dz * Math.cos(facing));
  const right = dx * Math.cos(facing) - dz * Math.sin(facing);
  const isInBox =
    forward >= -BOX_BEHIND_METRES && forward <= BOX_AHEAD_METRES && Math.abs(right) <= BOX_HALF_WIDTH_METRES;
  const isInFan =
    Math.hypot(dx, dz) <= FAN_RADIUS_METRES && computeFacingAngle(position, facing, centre) <= FAN_ANGLE / 2;
  return isInBox || isInFan;
};
