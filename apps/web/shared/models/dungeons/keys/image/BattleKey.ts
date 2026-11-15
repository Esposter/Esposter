export const BattleKey = { BattleForestBackground: "BattleForestBackground" } as const;
export type BattleKey = (typeof BattleKey)[keyof typeof BattleKey];
