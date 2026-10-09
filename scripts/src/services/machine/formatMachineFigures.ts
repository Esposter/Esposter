import { GpuFigureLabelMap } from "#src/services/machine/GpuFigureLabelMap";

// The figures a state line carries, the GPU's named by what the platform's reader measures; a GPU with no reader reads
// As none, never as a 0 it did not measure
export const formatMachineFigures = (
  cpuAveragePercentage: number,
  sampleCount: number,
  gpuPercentage: number | undefined,
  freeGigabytes: number,
  platform: NodeJS.Platform = process.platform,
): string => {
  const gpuFigure = gpuPercentage === undefined ? "none" : `${Math.round(gpuPercentage)}%`;
  const gpuLabel = GpuFigureLabelMap[platform] ?? "GPU";
  return `CPU ${Math.round(cpuAveragePercentage)}% over ${sampleCount} min, ${gpuLabel} ${gpuFigure}, ${freeGigabytes.toFixed(1)} GB free`;
};
