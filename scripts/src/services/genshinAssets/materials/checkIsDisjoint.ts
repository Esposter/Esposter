import type { ShaderConstant } from "#src/models/genshinAssets/materials/ShaderConstant";

import { computeEndByte } from "#src/services/genshinAssets/materials/computeEndByte";

// Whether no two of a layout's constants share a byte, as one program's layout never does: an overlap is two lists read
// As one
export const checkIsDisjoint = (layout: readonly ShaderConstant[]): boolean => {
  const sorted = layout.toSorted(
    (firstConstant, secondConstant) => firstConstant.byteOffset - secondConstant.byteOffset,
  );
  return sorted.every((constant, index) => {
    const previous = sorted[index - 1];
    return !previous || constant.byteOffset >= computeEndByte(previous);
  });
};
