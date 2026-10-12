import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const NEUVILLETTE_CHARACTER_ID = 10_000_087;

// Neuvillette's behaviour: none of his own, since his strikes, the short charged attack, his plunges, O Tears, I Shall
// Repay with its Spiritbreath Thorn and O Tides, I Have Returned with its Waterfalls are his record's alone. Spiritbreath
// Thorn's aligned 10-second cooldown is not built, as the skill's own twelve seconds always outlast it. Not built yet:
// Equitable Judgment, the held charged attack, whose length counts the Sourcewater droplets its legal evaluation picks up
// And whose judgement ticks drain Max HP, and the droplets the skill and burst leave, which nothing collects. His passives
// And constellations are not built
export const createNeuvilletteKitBehaviour = (): KitBehaviour => ({});
