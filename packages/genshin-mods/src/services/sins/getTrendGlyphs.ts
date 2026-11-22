import { TREND_GLYPHS } from "./constants";

// One glyph per point, its height the point's share of the tallest glyph
export const getTrendGlyphs = (trend: number[]): string =>
  trend.map((score) => TREND_GLYPHS.charAt(Math.round(score * (TREND_GLYPHS.length - 1)))).join("");
