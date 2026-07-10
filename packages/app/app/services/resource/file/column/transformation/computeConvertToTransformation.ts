import type { ColumnValue } from "#shared/models/resource/file/column/ColumnValue";
import type { ConvertToTransformation } from "#shared/models/resource/file/column/transformation/ConvertToTransformation";

import { ColumnType } from "#shared/models/resource/file/column/ColumnType";
import { coerceValue } from "@/services/resource/file/column/coerceValue";

export const computeConvertToTransformation = (
  value: ColumnValue,
  transformation: ConvertToTransformation,
): ColumnValue => {
  if (transformation.targetType === ColumnType.String) return value === null ? null : String(value);
  return coerceValue(value === null ? "" : String(value), transformation.targetType);
};
