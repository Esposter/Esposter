// The EXP a weapon of each rarity needs to rise past each level, keyed by its stars, a level's EXP at its index less one
export type RarityRequiredExpsMap = Readonly<Record<string, readonly number[]>>;
