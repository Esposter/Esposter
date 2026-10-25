// The bytes of a base64 float array, read as the host's floats
export const decodeFloat32 = (encoded: string): Float32Array => {
  const bytes = Buffer.from(encoded, "base64");
  return new Float32Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
};
