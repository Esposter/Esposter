// What the world says of the body at a step: whether it stands on walkable ground, rises from a jump, is high enough
// Above the ground to open its glider or plunge, is in water deeper than it wades, and faces a surface too steep to walk
export interface LocomotionContact {
  isFacingWall: boolean;
  isGrounded: boolean;
  isHighAboveGround: boolean;
  isInDeepWater: boolean;
  isRising: boolean;
}
