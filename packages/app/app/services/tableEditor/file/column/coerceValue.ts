import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";

import { BooleanValue } from "#shared/models/tableEditor/file/column/BooleanValue";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { exhaustiveGuard } from "@esposter/shared";

export const coerceValue = (value: string, type: ColumnType): ColumnValue => {
  const sanitizedValue = value.trim();
  if (!sanitizedValue) return null;
  switch (type) {
    case ColumnType.Boolean:
      return sanitizedValue.toLowerCase() === BooleanValue.True;
    case ColumnType.Computed:
      return null;
    case ColumnType.Date:
      return sanitizedValue;
    case ColumnType.Number: {
      const number = Number(sanitizedValue);
      return Number.isNaN(number) ? null : number;
    }
    case ColumnType.String:
      return sanitizedValue;
    default:
      return exhaustiveGuard(type);
  }
};
