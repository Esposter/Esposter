export const WikiTypeWishEventKind = { CharacterEvent: "Character Event", WeaponEvent: "Weapon Event" } as const;
export type WikiTypeWishEventKind = (typeof WikiTypeWishEventKind)[keyof typeof WikiTypeWishEventKind];
