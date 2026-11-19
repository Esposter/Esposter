// The bands a reference's pixels are sorted into to read where a frame's brightness errs. Shadows, mids and highlights
// split the reference's own CIELab lightness into thirds, and the above-threshold band is the pixels the bloom's
// prefilter takes, a channel of them over the threshold. The three lightness bands partition the pixels, and the
// Above-threshold band lies across the highlights
export const BrightnessBand = {
  AboveThreshold: "above threshold",
  Highlights: "highlights",
  Mids: "mids",
  Shadows: "shadows",
} as const;
export type BrightnessBand = (typeof BrightnessBand)[keyof typeof BrightnessBand];
