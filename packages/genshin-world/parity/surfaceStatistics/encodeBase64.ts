// Bytes per string-building chunk, short of the argument count a spread call can take
const CHUNK_BYTES = 0x8000;

// The base64 of a float array's bytes, through the browser's own encoder, so a term map crosses to the host as text
export const encodeBase64 = (values: Float32Array): string => {
  const bytes = new Uint8Array(values.buffer, values.byteOffset, values.byteLength);
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += CHUNK_BYTES)
    binary += String.fromCharCode(...bytes.subarray(offset, offset + CHUNK_BYTES));
  return btoa(binary);
};
