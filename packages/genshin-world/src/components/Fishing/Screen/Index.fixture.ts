import { FishingPhase } from "#src/models/fishing/FishingPhase";

// The reel at the instant fishing-reel.mkv shows at 52.5 seconds: a hooked fish pulling, the tension held at the bar's
// centre and the zone it is reeled in lying just to its right
export const props = { view: { phase: FishingPhase.Reeling, tension: 50, zone: { start: 49, width: 16 } } };
