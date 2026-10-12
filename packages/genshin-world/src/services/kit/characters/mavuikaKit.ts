import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const MAVUIKA_CHARACTER_ID = 10_000_106;

// Mavuika's behaviour: none of her own, since her strikes outside the Nightsoul Blessing, her charged attack and her low,
// High and collision plunges are her record's alone. Not built yet: the skill's press starts the Nightsoul Blessing and its
// Ring of Searing Radiance, so it has no hit and spends its cooldown, and Sunfell Slice is paid in Fighting Spirit, which
// The party's Nightsoul points feed and the framework does not hold, so its energy cost is unreachable and it cannot be
// Cast. Both wait on the Nightsoul hook
export const createMavuikaKitBehaviour = (): KitBehaviour => ({});
