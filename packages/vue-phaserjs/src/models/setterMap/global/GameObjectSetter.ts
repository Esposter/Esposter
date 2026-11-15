export const GameObjectSetter = { Active: "active" } as const;
export type GameObjectSetter = (typeof GameObjectSetter)[keyof typeof GameObjectSetter];
