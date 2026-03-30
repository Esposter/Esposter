import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";

import { NumberFormat } from "#shared/models/tableEditor/file/column/NumberFormat";
import { exhaustiveGuard } from "@esposter/shared";

export const formatNumber = (value: ColumnValue, format: NumberFormat): string => {
  if (typeof value !== "number") return "";
  switch (format) {
    case NumberFormat.Compact:
      return new Intl.NumberFormat(undefined, { notation: "compact" }).format(value);
    case NumberFormat.Currency:
      return new Intl.NumberFormat(undefined, { currency: "USD", style: "currency" }).format(value);
    case NumberFormat.Percentage:
      return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2, style: "percent" }).format(value / 100);
    case NumberFormat.Plain:
      return String(value);
    case NumberFormat.Scientific:
      return value.toExponential();
    default:
      return exhaustiveGuard(format);
  }
};
