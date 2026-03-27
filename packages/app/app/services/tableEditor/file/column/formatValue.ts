import type { ColumnFormat } from "#shared/models/tableEditor/file/column/ColumnFormat";
import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";

import { BooleanFormat, BooleanFormats } from "#shared/models/tableEditor/file/column/BooleanFormat";
import { NumberFormat, NumberFormats } from "#shared/models/tableEditor/file/column/NumberFormat";
import { dayjs } from "#shared/services/dayjs";
import { formatBoolean } from "@/services/tableEditor/file/column/formatBoolean";
import { formatNumber } from "@/services/tableEditor/file/column/formatNumber";

export const formatValue = (value: ColumnValue, format: ColumnFormat): string => {
  if (value === null) return "";
  else if (BooleanFormats.has(format)) return formatBoolean(value, format as BooleanFormat);
  else if (NumberFormats.has(format)) return formatNumber(value, format as NumberFormat);
  else if (typeof value !== "string") return "";
  else return dayjs(value).format(format);
};
