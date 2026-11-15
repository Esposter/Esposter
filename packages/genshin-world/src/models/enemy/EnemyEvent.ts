// What a step of an enemy's AI tells the world: its attack struck the target, or its death has passed and it is gone
export const EnemyEvent = { Defeated: "Defeated", Strike: "Strike" } as const;
export type EnemyEvent = (typeof EnemyEvent)[keyof typeof EnemyEvent];
