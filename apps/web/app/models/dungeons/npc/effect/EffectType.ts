export const EffectType = {
  Battle: "Battle",
  Heal: "Heal",
  Item: "Item",
  Message: "Message",
  SceneFade: "SceneFade",
  Trade: "Trade",
} as const;
export type EffectType = (typeof EffectType)[keyof typeof EffectType];
