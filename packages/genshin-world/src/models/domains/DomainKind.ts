// The challenge domains that open by Adventure Rank and by the day of the week. Blessing gives artifacts, Forgery
// Weapon Ascension materials and Mastery talent materials. Trounce is a weekly boss's domain, open every day and
// Unlocked by its quests, which a locked one is quick challenged past from the Adventure Rank its map gives
export const DomainKind = { Blessing: "Blessing", Forgery: "Forgery", Mastery: "Mastery", Trounce: "Trounce" } as const;
export type DomainKind = (typeof DomainKind)[keyof typeof DomainKind];
