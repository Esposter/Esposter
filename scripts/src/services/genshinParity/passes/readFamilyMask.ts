import { readTargetFamily } from "#src/services/genshinParity/passes/readTargetFamily";

// The pixels a part target draws a family at, one where it does and none elsewhere
export const readFamilyMask = (part: Float32Array, family: number, pixelCount: number): Uint8Array =>
  Uint8Array.from({ length: pixelCount }, (_pixel, pixel) => (readTargetFamily(part, pixel) === family ? 1 : 0));
