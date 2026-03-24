import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { ConvertToTransformation } from "#shared/models/tableEditor/file/column/transformation/ConvertToTransformation";

import { coerceValue } from "@/services/tableEditor/file/column/coerceValue";

export const computeConvertToTransformation = (
  value: ColumnValue,
  transformation: ConvertToTransformation,
): ColumnValue => coerceValue(value === null ? "" : String(value), transformation.targetType);
