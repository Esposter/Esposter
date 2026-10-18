import { createGcgTenguJuuraiSummon } from "#src/services/gcg/effects/createGcgTenguJuuraiSummon";

export const TENGU_JUURAI_STORMCLUSTER_ID = 114_062;

// Tengu Juurai: Stormcluster, Kujou Sara's summon (the wiki's Tengu Juurai: Stormcluster)
export const tenguJuuraiStormcluster = createGcgTenguJuuraiSummon({ damage: 2, usages: 2 });
