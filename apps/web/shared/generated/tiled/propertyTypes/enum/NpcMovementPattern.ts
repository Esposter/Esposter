export const NpcMovementPattern = {
  Clockwise: "Clockwise",
  Idle: "Idle",
} as const;
export type NpcMovementPattern = (typeof NpcMovementPattern)[keyof typeof NpcMovementPattern];
