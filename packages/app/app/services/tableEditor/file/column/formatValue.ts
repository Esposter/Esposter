import type { ColumnFormat } from "#shared/models/tableEditor/file/column/ColumnFormat";
import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";

import { BooleanFormat } from "#shared/models/tableEditor/file/column/BooleanFormat";
import { NumberFormat } from "#shared/models/tableEditor/file/column/NumberFormat";
import { dayjs } from "#shared/services/dayjs";
import { exhaustiveGuard } from "@esposter/shared";

const booleanFormats = new Set<string>(Object.values(BooleanFormat));
const numberFormats = new Set<string>(Object.values(NumberFormat));

const formatBoolean = (value: ColumnValue, format: BooleanFormat): string => {
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

const formatNumber = (value: ColumnValue, format: NumberFormat): string => {
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

export const formatValue = (value: ColumnValue, format: ColumnFormat): string => {
  if (value === null) return "";
  if (booleanFormats.has(format)) return formatBoolean(value, format as BooleanFormat);
  if (numberFormats.has(format)) return formatNumber(value, format as NumberFormat);
  return dayjs(value as string).format(format);
};
