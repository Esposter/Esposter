import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const CHASCA_CHARACTER_ID = 10_000_104;

// Chasca's behaviour: none of her own yet, since her strikes, fully-charged Aimed Shot, plunges, Spirit Reins' Resonance
// And Galesplitting are her record's alone. The Nightsoul Blessing her press starts is not built, nor are the five
// Soulseeker shells after Galesplitting, whose Radiant Shells take the party's elements, which a kit step cannot read yet
// Constellation 1 needs Bullet Trick's Spiritbinding Conversion, which the Ascension talent does not build
// Constellation 2 needs Bullet Trick's Spirit of the Radiant Shadow stacks, which the Ascension talent does not build
// Constellation 4 needs the Radiant Soulseeker Shells after Galesplitting, which are not built
// Constellation 6 needs Multitarget Fire's charge time and Bullet Trick's Spiritbinding Conversion, neither built
export const createChascaKitBehaviour = (): KitBehaviour => ({});
