import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const MIZUKI_CHARACTER_ID = 10_000_109;

// Mizuki's behaviour: none of her own, since her strikes, charged attack, plunges, the skill's activation hit and the
// Burst's hit are her record's alone. Not built: the Dreamdrifter state the press enters, with its clouds of Anemo that
// Drift on the field and its pick-up of the snacks the burst leaves, which the skill's and burst's Ascensions and
// Constellations read too, so the clouds wait on the Dreamdrifter state's hook
export const createMizukiKitBehaviour = (): KitBehaviour => ({});
