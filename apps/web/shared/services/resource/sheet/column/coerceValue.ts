import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

import { BooleanValue } from "#shared/models/resource/sheet/column/BooleanValue";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { exhaustiveGuard, normalizeString } from "@esposter/shared";

// A plain decimal literal, so the hexadecimal, binary and octal forms Number also reads are refused
const DECIMAL_REGEX = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/iu;

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
      // A literal too large for a double reads as Infinity, which a column cannot hold
      const number = Number(sanitizedValue);
      return DECIMAL_REGEX.test(sanitizedValue) && Number.isFinite(number) ? number : null;
    }
    case ColumnType.String:
      return sanitizedValue;
    default:
      return exhaustiveGuard(type);
  }
};
