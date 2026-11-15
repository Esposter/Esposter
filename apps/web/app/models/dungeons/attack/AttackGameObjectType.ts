// Attacks can be a simple base sprite
// Or it can be multiple sprites inside a container
export const AttackGameObjectType = { Container: "Container", Sprite: "Sprite" } as const;
export type AttackGameObjectType = (typeof AttackGameObjectType)[keyof typeof AttackGameObjectType];
