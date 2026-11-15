// The two kinds of event banner a wiki banner page can name, with the values the game's wish screen keys them by
export const WishEventKind = { CharacterEvent: "CharacterEvent", WeaponEvent: "WeaponEvent" } as const;
export type WishEventKind = (typeof WishEventKind)[keyof typeof WishEventKind];
