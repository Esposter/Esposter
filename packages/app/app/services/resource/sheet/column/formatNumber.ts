import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

import { NumberFormat } from "#shared/models/resource/sheet/column/NumberFormat";
import { COMPACT_NUMBER_FORMATTER, PERCENT_FORMATTER, USD_CURRENCY_FORMATTER } from "#shared/services/intl/constants";
import { exhaustiveGuard } from "@esposter/shared";

export const formatNumber = (value: ColumnValue, format: NumberFormat): string => {
  if (typeof value !== "number") return "";
  switch (format) {
    case NumberFormat.Compact:
      return COMPACT_NUMBER_FORMATTER.format(value);
    case NumberFormat.Currency:
      return USD_CURRENCY_FORMATTER.format(value);
    case NumberFormat.Percentage:
      return PERCENT_FORMATTER.format(value / 100);
    case NumberFormat.Plain:
      return String(value);
    case NumberFormat.Scientific:
      return value.toExponential();
    default:
      return exhaustiveGuard(format);
  }
};
