export const TileProperty = { Collision: "Collision" } as const;
export type TileProperty = (typeof TileProperty)[keyof typeof TileProperty];
