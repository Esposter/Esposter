import type { BaseSkyState } from "#src/atmosphere/BaseSkyState";

// How the sky and the light it casts look at one minute of the day. The sky blends between neighbouring keyframes,
// So a day is a handful of them in order: night, dawn, noon, dusk
export interface SkyKeyframe extends BaseSkyState {
  minutes: number;
}
