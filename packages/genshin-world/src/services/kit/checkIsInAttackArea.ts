import type { Enemy } from "#src/models/enemy/Enemy";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { KitBody } from "#src/models/kit/KitBody";

import { ENEMY_CAPSULE_HEIGHT, ENEMY_CAPSULE_RADIUS } from "#src/services/enemy/constants";
import { computeFacingAngle } from "#src/services/kit/computeFacingAngle";

// Whether an area, a cylinder centred on the body's feet or ahead of them by its forward offset, reaches a target's
// Capsule: within its radius plus the capsule's, within half its fan plus the capsule's angular half width as seen from
// That centre, and overlapping in height. The capsule stands on the ground and the cylinder spans half its height either
// Side of the feet. An ore is struck as an enemy's capsule is, at its ground point
export const checkIsInAttackArea = (
  area: AttackArea,
  { facing, height, position }: KitBody,
  target: Pick<Enemy, "position">,
): boolean => {
  const forward = area.forward ?? 0;
  const centre = { x: position.x - forward * Math.sin(facing), z: position.z - forward * Math.cos(facing) };
  const distance = Math.hypot(target.position.x - centre.x, target.position.z - centre.z);
  if (distance > area.radius + ENEMY_CAPSULE_RADIUS) return false;
  const capsuleAngle = distance > ENEMY_CAPSULE_RADIUS ? Math.asin(ENEMY_CAPSULE_RADIUS / distance) : Math.PI;
  const isInFan = computeFacingAngle(centre, facing, target.position) <= area.angle / 2 + capsuleAngle;
  const halfHeight = area.height / 2;
  return isInFan && height - halfHeight <= ENEMY_CAPSULE_HEIGHT && height + halfHeight >= 0;
};
