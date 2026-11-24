import { readFloat32Array } from "#src/services/shared/readFloat32Array";

// The bytes of a base64 float array, read as the host's floats
export const decodeFloat32 = (encoded: string): Float32Array => readFloat32Array(Buffer.from(encoded, "base64"));
