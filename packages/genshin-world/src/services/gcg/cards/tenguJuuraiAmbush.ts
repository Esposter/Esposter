import { createGcgTenguJuuraiSummon } from "#src/services/gcg/effects/createGcgTenguJuuraiSummon";

export const TENGU_JUURAI_AMBUSH_ID = 114_061;

// Tengu Juurai: Ambush, Kujou Sara's summon (the wiki's Tengu Juurai: Ambush)
export const tenguJuuraiAmbush = createGcgTenguJuuraiSummon({ damage: 1, usages: 1 });
