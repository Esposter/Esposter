// A sky's clouds by their statistics: their brightness over the clear sky as a ratio, the share of the sky they
// Cover, their edges' mean gradient over the step from the sky to them, and how far their brightness strays inside
// Them over that same step
export interface CloudStatistics {
  contrast: number;
  coverage: number;
  edgeSharpness: number;
  spread: number;
}
