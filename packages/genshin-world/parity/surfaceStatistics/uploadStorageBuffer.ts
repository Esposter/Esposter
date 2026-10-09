import { createStorageBuffer } from "#parity/surfaceStatistics/createStorageBuffer";

// A storage buffer holding the values given, written before any pass that reads it is submitted
export const uploadStorageBuffer = (device: GPUDevice, values: Float32Array): GPUBuffer => {
  const buffer = createStorageBuffer(device, values.length);
  device.queue.writeBuffer(buffer, 0, values);
  return buffer;
};
