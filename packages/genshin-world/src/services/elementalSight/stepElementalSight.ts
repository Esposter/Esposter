import type { ElementalSight } from "#src/models/sight/ElementalSight";
import type { Vector3Like } from "three";

import { SIGHT_WALK_LIMIT } from "#src/services/elementalSight/constants";

// The sight as the world steps it each frame: a press turns it off when it is on and on where the character stands when
// It is off, and it stays on, spreading, while the character has walked no further than the walk limit from where it was
// Turned on. Standing still keeps it on
export const stepElementalSight = (
  sight: ElementalSight,
  position: Vector3Like,
  deltaSeconds: number,
  isPressed: boolean,
): void => {
  if (isPressed && sight.isOn) sight.isOn = false;
  else if (isPressed) {
    sight.isOn = true;
    sight.origin.x = position.x;
    sight.origin.z = position.z;
    sight.spreadSeconds = 0;
  } else if (
    sight.isOn &&
    (position.x - sight.origin.x) ** 2 + (position.z - sight.origin.z) ** 2 > SIGHT_WALK_LIMIT ** 2
  )
    sight.isOn = false;
  else if (sight.isOn) sight.spreadSeconds += deltaSeconds;
};
