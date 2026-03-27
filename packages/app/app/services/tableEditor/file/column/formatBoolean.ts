import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";

import { BooleanFormat } from "#shared/models/tableEditor/file/column/BooleanFormat";
import { exhaustiveGuard } from "@esposter/shared";

export const formatBoolean = (value: ColumnValue, format: BooleanFormat): string => {
  if (typeof value !== "boolean") return "";
  switch (format) {
    case BooleanFormat.OneZero:
      return value ? "1" : "0";
    case BooleanFormat.TrueFalse:
      return value ? "true" : "false";
    case BooleanFormat.YesNo:
      return value ? "Yes" : "No";
    default:
      return exhaustiveGuard(format);
  }
};
