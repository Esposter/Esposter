// An empty storage buffer of the length given in floats, at least one float long so an empty input still binds
export const createStorageBuffer = (device: GPUDevice, length: number): GPUBuffer =>
  device.createBuffer({
    size: Math.max(length * Float32Array.BYTES_PER_ELEMENT, Float32Array.BYTES_PER_ELEMENT),
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
  });
