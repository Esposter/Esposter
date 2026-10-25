import type { ShaderConstant } from "#src/models/genshinAssets/materials/ShaderConstant";

import { REGISTER_BYTES } from "#src/services/genshinAssets/materials/constants";

// The registers a constant spans: its offset, over its rows (a matrix's four, a vector's one) and its array's length
export const computeRegisters = ({ arrayLength, byteOffset, rows }: ShaderConstant): number[] => {
  const count = Math.max(rows, 1) * Math.max(arrayLength, 1);
  const first = Math.floor(byteOffset / REGISTER_BYTES);
  return Array.from({ length: count }, (_value, index) => first + index);
};
