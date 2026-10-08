// An attack left as an aura keeps four fifths of its gauge, the aura tax, and lasts 2.5 seconds a unit of the attack's
// Gauge plus 7, decaying evenly
export const AURA_TAX = 0.8;
export const AURA_SECONDS_PER_GAUGE = 2.5;
export const AURA_BASE_SECONDS = 7;
// Frozen leaves twice the gauge it consumed as Freeze, which decays at 0.4 units a second and 0.1 faster every second it
// Holds, so a gauge G lasts 2√(5G + 4) - 4 seconds. A blunt hit drains 0.006 units of it a point of poise damage, and a
// Shatter takes 8
export const FREEZE_GAUGE_PER_CONSUMED_GAUGE = 2;
export const FREEZE_DECAY_RATE = 0.4;
export const FREEZE_DECAY_ACCELERATION = 0.1;
export const FREEZE_GAUGE_PER_POISE_DAMAGE = 0.006;
export const SHATTER_FREEZE_GAUGE = 8;
// Quicken leaves the gauge it consumed as its aura, lasting 5 seconds a unit plus 6
export const QUICKEN_SECONDS_PER_GAUGE = 5;
export const QUICKEN_BASE_SECONDS = 6;
// Burning leaves a 2-unit aura that never decays, and ticks every quarter second, applying 1 unit of Pyro under its
// Internal cooldown. The Dendro and Quicken under it drain at twice their own decay, and at 0.4 units a second at least
export const BURNING_AURA_GAUGE = 2;
export const BURNING_TICK_SECONDS = 0.25;
export const BURNING_PYRO_GAUGE = 1;
export const BURNING_DRAIN_PER_DECAY_RATE = 2;
export const BURNING_MINIMUM_DRAIN_RATE = 0.4;
// Electro-Charged ticks at once and every second after, each tick taking 0.4 units from its Electro and its Hydro where
// Either has more to give. Once one decays away it ends, ticking once more if half a second has passed since the last
export const ELECTRO_CHARGED_TICK_SECONDS = 1;
export const ELECTRO_CHARGED_TICK_GAUGE = 0.4;
export const ELECTRO_CHARGED_FINAL_TICK_SECONDS = 0.5;
// Crystallize triggers on a target once a second at most
export const CRYSTALLIZE_COOLDOWN_SECONDS = 1;
// A Swirl spreads its element at (G - 0.04) × 1.25 + 1 units, where G is the Anemo's gauge if the aura takes all of it
// And the aura's gauge if not
export const SWIRL_GAUGE_OFFSET = 0.04;
export const SWIRL_GAUGE_SCALE = 1.25;
export const SWIRL_BASE_GAUGE = 1;
