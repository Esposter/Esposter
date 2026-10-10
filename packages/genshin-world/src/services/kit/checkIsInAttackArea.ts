import type { Enemy } from "#src/models/enemy/Enemy";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { KitBody } from "#src/models/kit/KitBody";

import { ENEMY_CAPSULE_HEIGHT, ENEMY_CAPSULE_RADIUS } from "#src/services/enemy/constants";
import { computeFacingAngle } from "#src/services/kit/computeFacingAngle";

// Whether an area, a cylinder centred on the body's feet, reaches a target's capsule: within its radius plus the
// Capsule's, within half its fan plus the capsule's angular half width as seen from the body, and overlapping in height
// The capsule stands on the ground and the cylinder spans half its height either side of the feet. An ore is struck as an
// Enemy's capsule is, at its ground point
export const checkIsInAttackArea = (
  area: AttackArea,
  { facing, height, position }: KitBody,
  target: Pick<Enemy, "position">,
): boolean => {
  const distance = Math.hypot(target.position.x - position.x, target.position.z - position.z);
  if (distance > area.radius + ENEMY_CAPSULE_RADIUS) return false;
  const capsuleAngle = distance > ENEMY_CAPSULE_RADIUS ? Math.asin(ENEMY_CAPSULE_RADIUS / distance) : Math.PI;
  const isInFan = computeFacingAngle(position, facing, target.position) <= area.angle / 2 + capsuleAngle;
  const halfHeight = area.height / 2;
  return isInFan && height - halfHeight <= ENEMY_CAPSULE_HEIGHT && height + halfHeight >= 0;
};
