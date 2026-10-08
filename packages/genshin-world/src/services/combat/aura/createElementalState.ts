import type { ElementalState } from "#src/models/combat/ElementalState";

// A target with no element on it, its clock at zero
export const createElementalState = (): ElementalState => ({
  auras: new Map(),
  burningInternalCooldown: { hitIndex: 0, startSeconds: -Infinity },
  burningSeconds: 0,
  crystallizeSeconds: -Infinity,
  electroChargedSeconds: 0,
  seconds: 0,
});
