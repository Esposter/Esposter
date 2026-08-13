import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { BooleanValue } from "@/models/resource/sheet/column/BooleanValue";
import { exhaustiveGuard, normalizeString } from "@esposter/shared";

export const coerceValue = (value: string, type: ColumnType): ColumnValue => {
  const sanitizedValue = normalizeString(value);
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
