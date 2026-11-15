// What a good on a shop's offer gives: a Fate, which the wallet takes, or a character or a weapon of Paimon's Bargains' rotation
export const ShopOfferKind = { Character: "Character", Fate: "Fate", Weapon: "Weapon" } as const;
export type ShopOfferKind = (typeof ShopOfferKind)[keyof typeof ShopOfferKind];
