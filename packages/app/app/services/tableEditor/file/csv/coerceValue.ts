import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { BOOLEAN_VALUES } from "@/services/tableEditor/file/constants";

export const coerceValue = (value: string, type: ColumnType): ColumnValue => {
  const sanitizedValue = value.trim();
  if (!sanitizedValue) return null;
  else if (type === ColumnType.Boolean) return BOOLEAN_VALUES.has(sanitizedValue.toLowerCase());
  else if (type === ColumnType.Number) return Number(sanitizedValue);
  else return sanitizedValue;
};
