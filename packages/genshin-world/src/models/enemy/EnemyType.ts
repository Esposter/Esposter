// How hard an enemy is, spelt as the game's monster table spells its security level. A weekly boss is fought only in
// Its domain, so the open world holds these three
export const EnemyType = { Boss: "BOSS", Common: "NORMAL", Elite: "ELITE" } as const;
export type EnemyType = (typeof EnemyType)[keyof typeof EnemyType];
