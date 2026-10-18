import type { KitHitbox } from "#src/models/kit/KitHitbox";
import type { GroundPoint } from "genshin-engine";

import { ENEMY_CAPSULE_RADIUS } from "#src/services/enemy/constants";

// Whether an on-target hitbox anchored on the enemy at the anchor's ground point reaches the enemy at the other point,
// As a circle or a box reaches a capsule that stands on the ground, the capsule's radius counted in
export const checkIsInKitHitbox = (hitbox: KitHitbox, anchor: GroundPoint, enemy: GroundPoint): boolean => {
  const centreX = anchor.x + hitbox.offset.x;
  const centreZ = anchor.z + hitbox.offset.z;
  const { shape } = hitbox;
  if (shape.kind === "circle")
    return Math.hypot(enemy.x - centreX, enemy.z - centreZ) <= shape.radius + ENEMY_CAPSULE_RADIUS;
  const gapX = Math.max(Math.abs(enemy.x - centreX) - shape.width / 2, 0);
  const gapZ = Math.max(Math.abs(enemy.z - centreZ) - shape.length / 2, 0);
  return Math.hypot(gapX, gapZ) <= ENEMY_CAPSULE_RADIUS;
};
