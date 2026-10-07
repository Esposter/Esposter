import type { Loop } from "#src/models/genshinAssets/fit/Loop";
import type { Vector } from "#src/models/shared/Vector";

// The tones a part's surface is painted in, read off its texture over a plan: the tone most of it shows, and each other
// Tone and its gilding as the loops round it, every shade over the stone's colour
export interface PlanTones {
  stone: Vector;
  tones: { loops: Loop[]; shade: Vector }[];
}
