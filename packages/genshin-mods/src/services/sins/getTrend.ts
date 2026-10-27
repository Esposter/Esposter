import { SIN_TREND_LENGTH } from "./constants";
import { getPosteriorTrail } from "./getPosteriorTrail";

const TREND_GLYPHS = "▁▂▃▄▅▆▇█";

// The score after each of the last thirty prompts, from the same trail the score reads, so it is the score's own curve
export const getTrend = (evidences: number[]): number[] =>
  getPosteriorTrail(evidences)
    .slice(-SIN_TREND_LENGTH)
    .map(({ alpha, beta }) => alpha / (alpha + beta));

// One glyph per point, its height the point's share of the tallest glyph
export const getTrendGlyphs = (trend: number[]): string =>
  trend.map((score) => TREND_GLYPHS.charAt(Math.round(score * (TREND_GLYPHS.length - 1)))).join("");
