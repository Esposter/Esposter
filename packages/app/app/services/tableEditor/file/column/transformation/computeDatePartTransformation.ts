import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { DatePartTransformation } from "#shared/models/tableEditor/file/column/transformation/DatePartTransformation";

import { DatePartType } from "#shared/models/tableEditor/file/column/transformation/DatePartType";
import { dayjs } from "#shared/services/dayjs";

export const computeDatePartTransformation = (
  value: ColumnValue,
  transformation: DatePartTransformation,
): ColumnValue => {
  if (typeof value !== "string") return null;
  const parsed = dayjs(value, transformation.inputFormat, true);
  if (!parsed.isValid()) return null;
  switch (transformation.part) {
    case DatePartType.Day:
      return parsed.date();
    case DatePartType.Hour:
      return parsed.hour();
    case DatePartType.Minute:
      return parsed.minute();
    case DatePartType.Month:
      return parsed.month() + 1;
    case DatePartType.Weekday:
      return parsed.day();
    case DatePartType.Year:
      return parsed.year();
  }
};
