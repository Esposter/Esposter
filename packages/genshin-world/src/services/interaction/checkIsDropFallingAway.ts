// Whether a drop falls away at a place rather than lying on it: where the ground gives no height there, or the ground
// Lies below the water's level. A drop that falls away goes straight to the bag
export const checkIsDropFallingAway = (groundHeight: number, waterLevel: number): boolean =>
  !Number.isFinite(groundHeight) || groundHeight < waterLevel;
