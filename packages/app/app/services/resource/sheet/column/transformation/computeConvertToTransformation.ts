import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { ConvertToTransformation } from "#shared/models/resource/sheet/column/transformation/ConvertToTransformation";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { coerceValue } from "@/services/resource/sheet/column/coerceValue";

export const computeConvertToTransformation = (
  value: ColumnValue,
  transformation: ConvertToTransformation,
): ColumnValue => {
  if (transformation.targetType === ColumnType.String) return value === null ? null : String(value);
  return coerceValue(value === null ? "" : String(value), transformation.targetType);
};
