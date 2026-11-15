export const NpcAction = {
  Battle: "Battle",
  Heal: "Heal",
  Item: "Item",
  None: "None",
  Trade: "Trade",
} as const;
export type NpcAction = (typeof NpcAction)[keyof typeof NpcAction];
