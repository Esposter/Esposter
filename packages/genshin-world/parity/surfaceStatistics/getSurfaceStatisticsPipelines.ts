import { SURFACE_STATISTICS_SHADER } from "#parity/surfaceStatistics/surfaceStatisticsShader";

interface SurfaceStatisticsPipelines {
  blur: GPUComputePipeline;
  combine: GPUComputePipeline;
  reduce: GPUComputePipeline;
}

// The kernels compiled for one device, kept for every statistic it reads
const pipelinesByDevice = new WeakMap<GPUDevice, SurfaceStatisticsPipelines>();

export const getSurfaceStatisticsPipelines = (device: GPUDevice): SurfaceStatisticsPipelines => {
  const cached = pipelinesByDevice.get(device);
  if (cached) return cached;
  const module = device.createShaderModule({ code: SURFACE_STATISTICS_SHADER });
  const createPipeline = (entryPoint: string): GPUComputePipeline =>
    device.createComputePipeline({ compute: { entryPoint, module }, layout: "auto" });
  const pipelines = {
    blur: createPipeline("blurPass"),
    combine: createPipeline("combinePass"),
    reduce: createPipeline("reducePass"),
  };
  pipelinesByDevice.set(device, pipelines);
  return pipelines;
};
