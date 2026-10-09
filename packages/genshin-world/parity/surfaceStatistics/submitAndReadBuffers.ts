// The first `length` floats of a buffer, read back once the encoder is submitted
export interface BufferRead {
  buffer: GPUBuffer;
  length: number;
}

// Copies each read's floats to a staging buffer on the encoder, submits it, and returns the floats as the host reads them
export const submitAndReadBuffers = async (
  device: GPUDevice,
  encoder: GPUCommandEncoder,
  reads: BufferRead[],
): Promise<Float32Array[]> => {
  const stagings = reads.map(({ buffer, length }) => {
    const byteLength = length * Float32Array.BYTES_PER_ELEMENT;
    const staging = device.createBuffer({ size: byteLength, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
    encoder.copyBufferToBuffer(buffer, 0, staging, 0, byteLength);
    return staging;
  });
  device.queue.submit([encoder.finish()]);
  await Promise.all(stagings.map((staging) => staging.mapAsync(GPUMapMode.READ)));
  return stagings.map((staging) => {
    const values = new Float32Array(new Float32Array(staging.getMappedRange()));
    staging.unmap();
    staging.destroy();
    return values;
  });
};
