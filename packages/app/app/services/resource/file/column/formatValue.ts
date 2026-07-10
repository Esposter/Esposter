import type { ColumnFormat } from "#shared/models/resource/file/column/ColumnFormat";
import type { ColumnValue } from "#shared/models/resource/file/column/ColumnValue";

import { BooleanFormat, BooleanFormats } from "#shared/models/resource/file/column/BooleanFormat";
import { NumberFormat, NumberFormats } from "#shared/models/resource/file/column/NumberFormat";
import { dayjs } from "#shared/services/dayjs";
import { formatBoolean } from "@/services/resource/file/column/formatBoolean";
import { formatNumber } from "@/services/resource/file/column/formatNumber";

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
