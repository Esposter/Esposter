import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const IFA_CHARACTER_ID = 10_000_113;

// Ifa's behaviour outside her Nightsoul Blessing: none of her own, since her three normal attacks, charged attack,
// Compound Sedation Field's hit, and her low and collision plunges are her record's alone, and her skill's press a
// Placeholder spending its cooldown, as Mavuika's does. Her Tonic Shot, healing, sedation marks and passives and
// Constellations wait on the Nightsoul hook and the sedation-mark hook, and the low plunge, which gcsim plays only after
// The Nightsoul Blessing ends, is not gated. Her high plunge is borrowed as the page records
export const createIfaKitBehaviour = (): KitBehaviour => ({});
