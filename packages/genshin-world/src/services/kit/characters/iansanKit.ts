import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const IANSAN_CHARACTER_ID = 10_000_110;

// Iansan's behaviour: none, as her record builds her whole kit. Not built: the Nightsoul state the skill's press enters,
// Which swaps her charged attack for the Electro Swift Stormflight, drains her Nightsoul points and gives the burst's party
// ATK bonus, its conversion of those points into ATK on the active character. Each waits on the Nightsoul state hook, so
// The press is its activation hit only
export const createIansanKitBehaviour = (): KitBehaviour => ({});
