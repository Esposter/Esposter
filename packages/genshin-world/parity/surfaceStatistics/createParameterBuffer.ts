import type { SurfaceStatisticsParameters } from "#parity/surfaceStatistics/SurfaceStatisticsParameters";

import { SURFACE_STATISTICS_PARAMETERS_BYTES } from "#parity/surfaceStatistics/constants";

// A uniform buffer holding the parameters, in the layout the shader's struct declares
export const createParameterBuffer = (device: GPUDevice, parameters: SurfaceStatisticsParameters): GPUBuffer => {
  const buffer = device.createBuffer({
    size: SURFACE_STATISTICS_PARAMETERS_BYTES,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const view = new DataView(new ArrayBuffer(SURFACE_STATISTICS_PARAMETERS_BYTES));
  view.setUint32(0, parameters.count, true);
  view.setUint32(4, parameters.width, true);
  view.setUint32(8, parameters.height, true);
  view.setUint32(12, parameters.radius, true);
  view.setUint32(16, parameters.mode, true);
  view.setUint32(20, parameters.direction, true);
  view.setUint32(24, parameters.outputOffset, true);
  view.setFloat32(28, parameters.mean, true);
  view.setUint32(32, parameters.label, true);
  device.queue.writeBuffer(buffer, 0, view);
  return buffer;
};
