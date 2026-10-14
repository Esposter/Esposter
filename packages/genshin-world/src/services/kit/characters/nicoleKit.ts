import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const NICOLE_CHARACTER_ID = 10_000_131;

// Nicole's behaviour: none of her own, since her strikes, charged attack, plunges, skill's hit and burst's two hits are
// Her record's alone. Her burst's projections ask the characters' skills a copy of each, which a kit cannot read yet, and
// Her passives wait on their hooks
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/nicole/burst.go
export const createNicoleKitBehaviour = (): KitBehaviour => ({});
