import type { BinaryCursor } from "#src/models/genshinAssets/materials/BinaryCursor";

import {
  PARAMETER_FLAG_BYTES,
  VECTOR_OR_MATRIX_PARAMETER_BYTES,
} from "#src/services/genshinAssets/materials/constants";
import { skipAlignedParameters } from "#src/services/genshinAssets/materials/skipAlignedParameters";

const STRUCT_HEADER_BYTES = 16;

export const skipConstantBuffer = (cursor: BinaryCursor): void => {
  cursor.int32();
  skipAlignedParameters(cursor, VECTOR_OR_MATRIX_PARAMETER_BYTES, PARAMETER_FLAG_BYTES);
  skipAlignedParameters(cursor, VECTOR_OR_MATRIX_PARAMETER_BYTES, PARAMETER_FLAG_BYTES);
  cursor.list(() => {
    cursor.skip(STRUCT_HEADER_BYTES);
    skipAlignedParameters(cursor, VECTOR_OR_MATRIX_PARAMETER_BYTES, PARAMETER_FLAG_BYTES);
    skipAlignedParameters(cursor, VECTOR_OR_MATRIX_PARAMETER_BYTES, PARAMETER_FLAG_BYTES);
  });
  cursor.int32();
};
