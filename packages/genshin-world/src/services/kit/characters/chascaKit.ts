import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const CHASCA_CHARACTER_ID = 10_000_104;

// Chasca's behaviour: none of her own yet, since her strikes, fully-charged Aimed Shot, plunges, Spirit Reins' Resonance
// And Galesplitting are her record's alone. The Nightsoul Blessing her press starts is not built, nor are the five
// Soulseeker shells after Galesplitting, whose Radiant Shells take the party's elements, which a kit step cannot read yet
export const createChascaKitBehaviour = (): KitBehaviour => ({});
