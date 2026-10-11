// A Dendro Core stands half a second after its Bloom, as gcsim drops it, and bursts six seconds after that, as the wiki
// Gives it. At most five stand on the field, the oldest bursting as a sixth stands
export const DENDRO_CORE_DROP_SECONDS = 0.5;
export const DENDRO_CORE_LIFETIME_SECONDS = 6;
export const MAX_DENDRO_CORE_COUNT = 5;
// Electro on a core sends it off as Hyperbloom, which lands a second on, on the nearest enemy within 15 metres, as
// Gcsim's shot does
export const HYPERBLOOM_FLIGHT_SECONDS = 1;
export const HYPERBLOOM_HOMING_RADIUS = 15;
