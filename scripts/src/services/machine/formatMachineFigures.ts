// The figures a state line carries; a GPU with no reader reads as none, never as a 0 it did not measure
export const formatMachineFigures = (
  cpuAveragePercentage: number,
  sampleCount: number,
  gpuPercentage: number | undefined,
  freeGigabytes: number,
): string => {
  const gpuFigure = gpuPercentage === undefined ? "none" : `${Math.round(gpuPercentage)}%`;
  return `CPU ${Math.round(cpuAveragePercentage)}% over ${sampleCount} min, GPU 3D ${gpuFigure}, ${freeGigabytes.toFixed(1)} GB free`;
};
