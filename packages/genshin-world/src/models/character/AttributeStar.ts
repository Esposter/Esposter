// The traced marks the Attributes tab's rarity stars draw, one per point of the character's rarity
export const AttributeStar = { Star: "Star" } as const;
export type AttributeStar = (typeof AttributeStar)[keyof typeof AttributeStar];
