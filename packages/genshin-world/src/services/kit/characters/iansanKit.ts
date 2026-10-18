import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const IANSAN_CHARACTER_ID = 10_000_110;

// Iansan's behaviour: none, as her record builds her whole kit. Not built: the Nightsoul state the skill's press enters,
// Which swaps her charged attack for the Electro Swift Stormflight, drains her Nightsoul points and gives the burst's party
// ATK bonus, its conversion of those points into ATK on the active character. Each waits on the Nightsoul state hook, so
// The press is its activation hit only
// Constellation 1 needs the energy from each 6 Nightsoul points consumed, which waits on the Nightsoul state
// Constellation 2 needs Precise Movement on the burst, which the Nightsoul state's hook does not give yet
// Constellation 4 needs the Surging Force stacks after another character's burst, which the kit does not read
// Constellation 6 needs the Kinetic Energy Scale's extra 3 seconds and Extreme Force on overflow, not built
export const createIansanKitBehaviour = (): KitBehaviour => ({});
