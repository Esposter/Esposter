import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const MAVUIKA_CHARACTER_ID = 10_000_106;

// Mavuika's behaviour: none of her own, since her strikes outside the Nightsoul Blessing, her charged attack and her low,
// High and collision plunges are her record's alone. Not built yet: the skill's press starts the Nightsoul Blessing and its
// Ring of Searing Radiance, so it has no hit and spends its cooldown, and Sunfell Slice is paid in Fighting Spirit, which
// The party's Nightsoul points feed and the framework does not hold, so its energy cost is unreachable and it cannot be
// Cast. Both wait on the Nightsoul hook
// Constellation 1 needs Nightsoul points and Fighting Spirit, which the kit does not build
// Constellation 2 needs the Nightsoul's Blessing state, which the kit does not build
// Constellation 4 needs her Ascension talent Kiongozi, which is not built
// Constellation 6 needs the All-Fire Armaments of The Named Moment, which the kit does not build
export const createMavuikaKitBehaviour = (): KitBehaviour => ({});
