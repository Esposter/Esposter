// The modes the Perpetual Mechanical Array's fight passes through: it attacks, takes Defensive Mode until its highlighted
// Sentinel is disabled or its time runs out, is paralysed after a disabled sentinel, and is invulnerable as the paralysis ends
export const PerpetualMechanicalArrayMode = {
  Attacking: "Attacking",
  DefensiveMode: "DefensiveMode",
  Invulnerable: "Invulnerable",
  Paralysed: "Paralysed",
} as const;
export type PerpetualMechanicalArrayMode =
  (typeof PerpetualMechanicalArrayMode)[keyof typeof PerpetualMechanicalArrayMode];
