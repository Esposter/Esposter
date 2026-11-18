import type { BaseWorldEffect } from "#src/models/effects/BaseWorldEffect";
import type { WorldEffect } from "#src/models/effects/WorldEffect";

// Shows a world effect at the point it is given for its whole life. The point is copied, since the body a cast or a hit
// Reads it from moves on each step while the effect runs
export const addWorldEffect = (effects: WorldEffect[], effect: BaseWorldEffect): void => {
  effects.push({
    ...effect,
    position: { x: effect.position.x, z: effect.position.z },
    secondsRemaining: effect.seconds,
  });
};
