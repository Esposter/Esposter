import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";

export const coerceValue = (value: string, type: ColumnType): ColumnValue => {
  const sanitizedValue = value.trim();
  if (!sanitizedValue) return null;
  else if (type === ColumnType.Boolean) return sanitizedValue.toLowerCase() === "true";
  else if (type === ColumnType.Number) {
    const number = Number(sanitizedValue);
    return Number.isNaN(number) ? null : number;
  } else if (type === ColumnType.Date) return sanitizedValue;
  else return sanitizedValue;
};
