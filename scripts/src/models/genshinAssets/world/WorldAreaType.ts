// The level of an area in the game's own table: a level-one area is a part of the map its Statue of The Seven lights,
// A level-two one a place within it, as the dump spells each
export const WorldAreaType = { Level1: "LEVEL_1", Level2: "LEVEL_2" } as const;
export type WorldAreaType = (typeof WorldAreaType)[keyof typeof WorldAreaType];
