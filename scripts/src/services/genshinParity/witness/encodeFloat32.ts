// A float array's bytes as base64, for the page to read
export const encodeFloat32 = (values: Float32Array): string =>
  Buffer.from(values.buffer, values.byteOffset, values.byteLength).toString("base64");
