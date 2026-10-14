export interface SurfaceStatisticsPage {
  close: () => Promise<void>;
  // A surface's statistics over the pixels its mask holds, reduced on the page's GPU, as `computeStructureError` reads them
  computeStatistics: (
    values: Float32Array,
    mask: Uint8Array,
    width: number,
    height: number,
    sigmas: readonly number[],
  ) => Promise<number[]>;
}
