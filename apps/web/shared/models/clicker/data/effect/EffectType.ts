export const EffectType = {
  Additive: "Additive",
  // Adds value based on how many of the named buildings are owned
  BuildingAdditive: "BuildingAdditive",
  // Considers every building except the named ones
  BuildingAdditiveNor: "BuildingAdditiveNor",
  Multiplicative: "Multiplicative",
} as const;
export type EffectType = (typeof EffectType)[keyof typeof EffectType];

export const EffectTypes = Object.values(EffectType);
