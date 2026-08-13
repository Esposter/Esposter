import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { ColumnFormat } from "@/models/resource/sheet/column/ColumnFormat";

import { BooleanFormat, BooleanFormats } from "#shared/models/resource/sheet/column/BooleanFormat";
import { NumberFormat, NumberFormats } from "#shared/models/resource/sheet/column/NumberFormat";
import { dayjs } from "#shared/services/dayjs";
import { formatBoolean } from "@/services/resource/sheet/column/formatBoolean";
import { formatNumber } from "@/services/resource/sheet/column/formatNumber";

export const formatValue = (value: ColumnValue, format: ColumnFormat): string => {
  if (value === null) return "";
  else if (BooleanFormats.has(format as BooleanFormat)) return formatBoolean(value, format as BooleanFormat);
  else if (NumberFormats.has(format as NumberFormat)) return formatNumber(value, format as NumberFormat);
  else if (typeof value === "string") {
    // A malformed string in a date column falls back to the raw value instead of rendering "Invalid Date"
    const date = dayjs(value);
    return date.isValid() ? date.format(format) : value;
  } else return "";
};
