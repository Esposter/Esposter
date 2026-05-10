import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { ConvertToTransformation } from "#shared/models/tableEditor/file/column/transformation/ConvertToTransformation";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { coerceValue } from "@/services/tableEditor/file/column/coerceValue";

export const computeConvertToTransformation = (
  value: ColumnValue,
  transformation: ConvertToTransformation,
): ColumnValue => {
  if (transformation.targetType === ColumnType.String) return value === null ? null : String(value);
  return coerceValue(value === null ? "" : String(value), transformation.targetType);
};
