import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const PRUNE_CHARACTER_ID = 10_000_132;

// Prune's behaviour: none of her own, since her strikes, charged attack, plunges, skill's press and burst's initial hit are
// Her record's alone. Her skill's Clang Clang convert state and her burst's Witchlure Bell, a DoT of ticks at the burst's
// Start and its detection area, wait on their hooks, as do her passives
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/prune/burst.go
export const createPruneKitBehaviour = (): KitBehaviour => ({});
