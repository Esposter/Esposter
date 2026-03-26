import type { DateFormat } from "#shared/models/tableEditor/file/column/DateFormat";
import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { DatePartTransformation } from "#shared/models/tableEditor/file/column/transformation/DatePartTransformation";

import { DatePartType } from "#shared/models/tableEditor/file/column/transformation/DatePartType";
import { dayjs } from "#shared/services/dayjs";
import { exhaustiveGuard } from "@esposter/shared";

export const computeDatePartTransformation = (
  value: ColumnValue,
  transformation: DatePartTransformation,
  inputFormat: DateFormat,
): ColumnValue => {
  if (typeof value !== "string") return null;
  const parsedDate = dayjs(value, inputFormat, true);
  if (!parsedDate.isValid()) return null;
  switch (transformation.part) {
    case DatePartType.Day:
      return parsedDate.date();
    case DatePartType.Hour:
      return parsedDate.hour();
    case DatePartType.Minute:
      return parsedDate.minute();
    case DatePartType.Month:
      return parsedDate.month() + 1;
    case DatePartType.Weekday:
      return parsedDate.day();
    case DatePartType.Year:
      return parsedDate.year();
    default:
      return exhaustiveGuard(transformation.part);
  }
};
