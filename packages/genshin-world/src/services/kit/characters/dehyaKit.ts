import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const DEHYA_CHARACTER_ID = 10_000_079;

// Dehya's behaviour: none of her own, since her strikes, charged attack, plunges and Molten Inferno's initial hit are her
// Record's alone. Not built: the Sanctum Molten Inferno leaves, with its DoT and Redmane's Blood's mitigation, Ranging
// Flame's reposition, the burst's Flame-Mane's Fists and Incineration Drive, and her passives
// Constellation 1 needs her Max HP raised by 20%, which the attributes do not read back, and Molten Inferno's DMG on it
// Constellation 2 needs the Fiery Sanctum field that Molten Inferno: Ranging Flame recreates, not built by the burst
// Constellation 4 needs the Flame-Mane's Fist and Incineration Drive hits during Leonine Bite, not built
// Constellation 6 needs Leonine Bite's CRIT Rate and the Flame-Mane's Fist follow-up, not built
export const createDehyaKitBehaviour = (): KitBehaviour => ({});
