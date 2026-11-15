// What happens to an outcrop: the player touches it, the last of its enemies is defeated, or its blossom is claimed
export const OutcropEvent = { Claimed: "Claimed", LastEnemyDefeated: "LastEnemyDefeated", Touched: "Touched" } as const;
export type OutcropEvent = (typeof OutcropEvent)[keyof typeof OutcropEvent];
