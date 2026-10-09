// The utilisation line a claim and a status table carry: CPU and GPU percentages and the free memory. A GPU no reader
// Measured reads as none, never as a zero it did not measure
export const formatMachineLoad = (
  cpuPercentage: number,
  gpuPercentage: number | undefined,
  freeGigabytes: number,
): string => {
  const gpuFigure = gpuPercentage === undefined ? "none" : `${Math.round(gpuPercentage)}%`;
  return `CPU ${Math.round(cpuPercentage)}%, GPU 3D ${gpuFigure}, ${freeGigabytes.toFixed(1)} GB free`;
};
