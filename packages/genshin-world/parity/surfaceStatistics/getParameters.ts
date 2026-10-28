import type { SurfaceStatisticsParameters } from "#parity/surfaceStatistics/SurfaceStatisticsParameters";

// The uniform's fields a pass does not read are left at zero
export const getParameters = (overrides: Partial<SurfaceStatisticsParameters>): SurfaceStatisticsParameters => ({
  count: 0,
  direction: 0,
  height: 0,
  label: 0,
  mean: 0,
  mode: 0,
  outputOffset: 0,
  radius: 0,
  width: 0,
  ...overrides,
});
