import type { SinPosterior } from "../../models/SinPosterior";

import { SIN_HALF_LIFE_PROMPTS } from "./constants";

const TREND_GLYPHS = "▁▂▃▄▅▆▇█";

// The score after each of the last half-life's prompts, from the trail the score reads, so it is the score's own curve
export const getTrend = (trail: SinPosterior[]): number[] =>
  trail.slice(-SIN_HALF_LIFE_PROMPTS).map(({ alpha, beta }) => alpha / (alpha + beta));

// One glyph per point, its height the point's share of the tallest glyph
export const getTrendGlyphs = (trend: number[]): string =>
  trend.map((score) => TREND_GLYPHS.charAt(Math.round(score * (TREND_GLYPHS.length - 1)))).join("");
