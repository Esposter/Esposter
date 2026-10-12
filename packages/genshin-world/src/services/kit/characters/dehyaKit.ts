import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const DEHYA_CHARACTER_ID = 10_000_079;

// Dehya's behaviour: none of her own, since her strikes, charged attack, plunges and Molten Inferno's initial hit are her
// Record's alone. Not built: the Sanctum Molten Inferno leaves, with its DoT and Redmane's Blood's mitigation, Ranging
// Flame's reposition, the burst's Flame-Mane's Fists and Incineration Drive, and her passives
export const createDehyaKitBehaviour = (): KitBehaviour => ({});
