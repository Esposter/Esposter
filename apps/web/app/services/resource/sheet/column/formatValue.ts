import type { BooleanFormat } from "#shared/models/resource/sheet/column/BooleanFormat";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { NumberFormat } from "#shared/models/resource/sheet/column/NumberFormat";
import type { ColumnFormat } from "@/models/resource/sheet/column/ColumnFormat";

import { BooleanFormats } from "#shared/models/resource/sheet/column/BooleanFormat";
import { NumberFormats } from "#shared/models/resource/sheet/column/NumberFormat";
import { formatDate } from "#shared/util/date/formatDate";
import { parseLooseDate } from "#shared/util/date/parseLooseDate";
import { formatBoolean } from "@/services/resource/sheet/column/formatBoolean";
import { formatNumber } from "@/services/resource/sheet/column/formatNumber";

// Each set is typed to its own enum, so a column's format can only be asked about through the wider view of it
const BOOLEAN_FORMAT_SET: ReadonlySet<ColumnFormat> = BooleanFormats;
const NUMBER_FORMAT_SET: ReadonlySet<ColumnFormat> = NumberFormats;
const checkIsBooleanFormat = (format: ColumnFormat): format is BooleanFormat => BOOLEAN_FORMAT_SET.has(format);
const checkIsNumberFormat = (format: ColumnFormat): format is NumberFormat => NUMBER_FORMAT_SET.has(format);

export const formatValue = (value: ColumnValue, format: ColumnFormat) => {
  if (value === null) return "";
  else if (checkIsBooleanFormat(format)) return formatBoolean(value, format);
  else if (checkIsNumberFormat(format)) return formatNumber(value, format);
  else if (typeof value === "string") {
    // The column's own format reads its cells, so a day-first value keeps its day. Text in another shape falls back
    // To the loose reader, and a malformed string to the raw value instead of rendering "Invalid Date"
    const date = parseLooseDate(value, format);
    return date ? formatDate(date, format) : value;
  } else return "";
};
