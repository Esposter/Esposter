import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const VARKA_CHARACTER_ID = 10_000_128;

// Varka's behaviour: none of her own, since her skill's Initial hit, her burst's two hits and her strikes, charged attack
// And plunges are her record's alone. Her skill's Four Winds, the state a second press converts it to, and the Anemo
// And Cryo infusion it gives her waits on the Four Winds hook, and her passives wait on their hooks
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/varka/skill.go
// Constellation 1 needs the Sturm und Drang switch's Windbound Execution effects, which the kit does not build
// Constellation 2 needs the Four Winds' Ascension Cryo infusion and its extra hits, which the kit does not build
// Constellation 6 needs the Sturm und Drang mode's own effects, which the kit does not build
export const createVarkaKitBehaviour = (): KitBehaviour => ({});
