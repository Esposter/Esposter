import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const MIZUKI_CHARACTER_ID = 10_000_109;

// Mizuki's behaviour: none of her own, since her strikes, charged attack, plunges, the skill's activation hit and the
// Burst's hit are her record's alone. Not built: the Dreamdrifter state the press enters, with its clouds of Anemo that
// Drift on the field and its pick-up of the snacks the burst leaves, which the skill's and burst's Ascensions and
// Constellations read too, so the clouds wait on the Dreamdrifter state's hook
// Constellation 1 needs the Dreamdrifter state and its Twenty-Three Nights' Awaiting effect, which are not built
// Constellation 2 needs the Dreamdrifter state's Elemental Mastery bonus for the party, which is not built
// Constellation 4 needs the Yumemi Style Special Snacks from her burst, which the kit does not build
// Constellation 6 needs the Dreamdrifter state and a CRIT hook on the Swirl, which the kit does not build
export const createMizukiKitBehaviour = (): KitBehaviour => ({});
