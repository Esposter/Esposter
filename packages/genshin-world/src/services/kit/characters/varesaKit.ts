import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const VARESA_CHARACTER_ID = 10_000_111;

// Varesa's behaviour outside her Nightsoul Blessing: none of her own, since her strikes, charged attack, plunges, Rush and
// Flying Kick are her record's alone. The Fiery Passion forms, the Nightsoul points, the apex state with its Volcanic
// Kablam and the Follow-Up Strike after Rush wait on the Nightsoul hook and the Rush follow-up hook
// Constellation 1 needs the Ascension talent Tag-Team Triple Jump's enhancement, which the kit does not build
// Constellation 2 needs Apex Drive after a Plunging Attack, which the kit does not build
// Constellation 4 needs the buffs by Varesa's state on Guardian Vent, which the kit does not build
// Constellation 6 needs Apex Drive's Energy and a CRIT DMG bonus, which no strike hook can apply here
export const createVaresaKitBehaviour = (): KitBehaviour => ({});
