// A shield of an element absorbs damage of that element at 250% efficiency, and a Geo shield every damage at 150%
export const ELEMENTAL_SHIELD_ABSORPTION = 2.5;
export const GEO_SHIELD_ABSORPTION = 1.5;
// A Crystallize shard drops 23 frames after its reaction, out from the target's edge at a random bearing, and may be
// Picked up 31 frames after it drops, as gcsim holds them. It lies 15 seconds, and of more than three on the
// Ground all but the newest three go after about 2 seconds, as the wiki gives them
export const CRYSTALLIZE_SHARD_DROP_SECONDS = 23 / 60;
export const CRYSTALLIZE_SHARD_PICKUP_DELAY_SECONDS = 31 / 60;
export const CRYSTALLIZE_SHARD_SECONDS = 15;
export const CRYSTALLIZE_SHARD_LIMIT = 3;
export const CRYSTALLIZE_EXCESS_SHARD_SECONDS = 2;
// Provisional: the character on the field picks a shard up within 2 metres of it, gcsim's shard radius, as no source
// Gives the reach the game draws a shard to the character from
export const CRYSTALLIZE_SHARD_PICKUP_RADIUS = 2;
// The Crystallize shield a shard grants lasts 15 seconds from its pickup, as the wiki gives it
export const CRYSTALLIZE_SHIELD_SECONDS = 15;
