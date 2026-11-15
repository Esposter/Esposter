export const ItemId = {
  DamagedBall: "DamagedBall",
  Potion: "Potion",
} as const;
export type ItemId = (typeof ItemId)[keyof typeof ItemId];
