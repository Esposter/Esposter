import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const PRUNE_CHARACTER_ID = 10_000_132;

// Prune's behaviour: none of her own, since her strikes, charged attack, plunges, skill's press and burst's initial hit are
// Her record's alone. Her skill's Clang Clang convert state and her burst's Witchlure Bell, a DoT of ticks at the burst's
// Start and its detection area, wait on their hooks, as do her passives
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/prune/burst.go
// Constellation 1 needs the Banehunter Oathhammer's Elemental Conversion, which the kit does not build
// Constellation 2 needs the Hunt the Witch ATK bonus in the Witchlure Bell's Hunter-Seeker mode, not built
// Constellation 4 needs the Elemental Conversion Oathhammer summons from the burst, which the kit does not build
// Constellation 6 needs the Witchlure Bell's Hunter-Seeker extension and the Tolling Rally reactions, not built
export const createPruneKitBehaviour = (): KitBehaviour => ({});
