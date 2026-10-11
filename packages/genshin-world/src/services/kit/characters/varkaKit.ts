import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const VARKA_CHARACTER_ID = 10_000_128;

// Varka's behaviour: none of her own, since her skill's Initial hit, her burst's two hits and her strikes, charged attack
// And plunges are her record's alone. Her skill's Four Winds, the state a second press converts it to, and the Anemo
// And Cryo infusion it gives her waits on the Four Winds hook, and her passives wait on their hooks
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/varka/skill.go
export const createVarkaKitBehaviour = (): KitBehaviour => ({});
