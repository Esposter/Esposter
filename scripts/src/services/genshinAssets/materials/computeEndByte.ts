import type { ShaderConstant } from "#src/models/genshinAssets/materials/ShaderConstant";

import { computeRegisters } from "#src/services/genshinAssets/materials/computeRegisters";
import { COMPONENT_BYTES, REGISTER_BYTES } from "#src/services/genshinAssets/materials/constants";

// The byte past a constant's last: its last register's columns, past every register before it
export const computeEndByte = (constant: ShaderConstant): number =>
  constant.byteOffset + (computeRegisters(constant).length - 1) * REGISTER_BYTES + constant.columns * COMPONENT_BYTES;
