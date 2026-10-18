import type { ElementalState } from "#src/models/combat/ElementalState";

// A target with no element on it, its clock at zero, and immune to Frozen only where its kind is
export const createElementalState = (isFrozenImmune = false): ElementalState => ({
  auras: new Map(),
  auraSourceDeficitMap: new Map(),
  burningInternalCooldown: { hitIndex: 0, startSeconds: -Infinity },
  burningSeconds: 0,
  crystallizeSeconds: -Infinity,
  electroChargedSeconds: 0,
  isFrozenImmune,
  isLunarCharged: false,
  lunarChargedSeconds: -Infinity,
  seconds: 0,
});
