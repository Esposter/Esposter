import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const NEUVILLETTE_CHARACTER_ID = 10_000_087;

// Neuvillette's behaviour: none of his own, since his strikes, the short charged attack, his plunges, O Tears, I Shall
// Repay with its Spiritbreath Thorn and O Tides, I Have Returned with its Waterfalls are his record's alone. Spiritbreath
// Thorn's aligned 10-second cooldown is not built, as the skill's own twelve seconds always outlast it. Not built yet:
// Equitable Judgment, the held charged attack, whose length counts the Sourcewater droplets its legal evaluation picks up
// And whose judgement ticks drain Max HP, and the droplets the skill and burst leave, which nothing collects. His passives
// And constellations are not built
// Constellation 1 needs Past Draconic Glories from the Ascension talent Heir to the Ancient Sea's Authority, not built
// Constellation 2 needs that Ascension talent's CRIT DMG per Past Draconic Glories, which the kit does not build
// Constellation 4 needs Sourcewater Droplets generated when he is healed, which the kit does not build
// Constellation 6 needs Sourcewater Droplets and the Equitable Judgment currents, which the kit does not build
export const createNeuvilletteKitBehaviour = (): KitBehaviour => ({});
