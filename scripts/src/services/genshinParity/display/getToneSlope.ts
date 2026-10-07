import type { Vector } from "#src/models/shared/Vector";

import { CHANNELS } from "#src/services/genshinParity/shared/constants";
import { GENSHIN_TONE_CONTRAST, GENSHIN_TONE_EXPOSURE, TONE_CONTRAST_OFFSET, TONE_CURVE_LIFT } from "genshin-engine";

// How steeply the tone curve (`toneMapGenshin`) shows each channel of a scene colour change: a solve in scene colour,
// Each equation weighted by it, is a solve of what the screen shows to first order. Unweighted, the curve's inverse
// Stretches a pixel near white to about thirteen, so the brightest pixels decide the solve, and a clipped one, which
// The screen shows the same however bright, is read as exact. Under none it is the slope at none, the steepest a solve
// Weighs: toward the curve's floor (`TONE_CURVE_FLOOR`) the slope runs without bound, and the screen's byte steps there
// Are already finer than any scene colour a solve settles
export const getToneSlope = (sceneColor: Readonly<Vector>): Vector =>
  CHANNELS.map((channel) => {
    const falloff = 2 ** (-GENSHIN_TONE_EXPOSURE * Math.max(sceneColor[channel], 0));
    // Past where the curve reaches white, it shows nothing brighter
    if (falloff <= TONE_CURVE_LIFT) return 0;
    const power = GENSHIN_TONE_CONTRAST + TONE_CONTRAST_OFFSET;
    return power * (1 + TONE_CURVE_LIFT - falloff) ** (power - 1) * GENSHIN_TONE_EXPOSURE * Math.LN2 * falloff;
  }) as Vector;
