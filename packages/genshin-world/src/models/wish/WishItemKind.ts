// What a wish draws: a character, or a weapon
export const WishItemKind = { Character: "Character", Weapon: "Weapon" } as const;
export type WishItemKind = (typeof WishItemKind)[keyof typeof WishItemKind];
