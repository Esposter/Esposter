// The utilisation line a claim and a status table carry: CPU and GPU percentages and the free memory. A GPU or a free
// Memory no reader measured reads as none, never as a zero it did not measure
export const formatMachineLoad = (
  cpuPercentage: number,
  gpuPercentage: number | undefined,
  freeGigabytes: number | undefined,
): string => {
  const gpuFigure = gpuPercentage === undefined ? "none" : `${Math.round(gpuPercentage)}%`;
  const freeFigure = freeGigabytes === undefined ? "none" : `${freeGigabytes.toFixed(1)} GB`;
  return `CPU ${Math.round(cpuPercentage)}%, GPU 3D ${gpuFigure}, ${freeFigure} free`;
};
