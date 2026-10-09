import type { AttackArea } from "#src/models/kit/AttackArea";

// The reach of a hit gcsim centres on the primary target, as a circle of the radius it gives there. An area does not
// Hold a target, which lies within the action's targeting area, so the hit is priced round the body at that area's
// Radius plus its own
export const createTargetedHitArea = (targetingArea: AttackArea, radius: number): AttackArea =>
  Object.freeze({ angle: 2 * Math.PI, height: 2, radius: targetingArea.radius + radius });
