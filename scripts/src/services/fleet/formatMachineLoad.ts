import { GpuFigureLabelMap } from "#src/services/machine/GpuFigureLabelMap";

// The utilisation line a claim and a status table carry: CPU and GPU percentages and the free memory. A GPU or a free
// Memory no reader measured reads as none, never as a zero it did not measure. The GPU is named by the platform whose
// Reader took it, so a heartbeat carries its writer's platform and a platform-less heartbeat reads as the generic GPU
export const formatMachineLoad = (
  cpuPercentage: number,
  gpuPercentage: number | undefined,
  freeGigabytes: number | undefined,
  platform: NodeJS.Platform | undefined,
): string => {
  const gpuFigure = gpuPercentage === undefined ? "none" : `${Math.round(gpuPercentage)}%`;
  const freeFigure = freeGigabytes === undefined ? "none" : `${freeGigabytes.toFixed(1)} GB`;
  const gpuLabel = platform === undefined ? "GPU" : (GpuFigureLabelMap[platform] ?? "GPU");
  return `CPU ${Math.round(cpuPercentage)}%, ${gpuLabel} ${gpuFigure}, ${freeFigure} free`;
};
