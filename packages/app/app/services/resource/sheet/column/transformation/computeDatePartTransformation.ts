import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { DateFormat } from "#shared/models/resource/sheet/column/DateFormat";
import type { DatePartTransformation } from "#shared/models/resource/sheet/column/transformation/DatePartTransformation";

import { DatePartType } from "#shared/models/resource/sheet/column/transformation/DatePartType";
import { parseDate } from "#shared/util/date/parseDate";
import { exhaustiveGuard, getZonedDateTime } from "@esposter/shared";

const DAYS_IN_WEEK = 7;

export const computeDatePartTransformation = (
  value: ColumnValue,
  transformation: DatePartTransformation,
  inputFormat: DateFormat,
): ColumnValue => {
  if (typeof value !== "string") return null;
  const parsedDate = parseDate(value, inputFormat);
  if (!parsedDate) return null;
  const zonedDateTime = getZonedDateTime(parsedDate);
  switch (transformation.part) {
    case DatePartType.Day:
      return zonedDateTime.day;
    case DatePartType.Hour:
      return zonedDateTime.hour;
    case DatePartType.Minute:
      return zonedDateTime.minute;
    case DatePartType.Month:
      return zonedDateTime.month;
    // Temporal counts Monday as 1 through Sunday as 7; a weekday column reads Sunday as 0, the spelling every
    // Spreadsheet's WEEKDAY uses, so the week wraps rather than being renumbered
    case DatePartType.Weekday:
      return zonedDateTime.dayOfWeek % DAYS_IN_WEEK;
    case DatePartType.Year:
      return zonedDateTime.year;
    default:
      return exhaustiveGuard(transformation.part);
  }
};
