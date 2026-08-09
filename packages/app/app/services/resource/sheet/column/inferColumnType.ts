import type { DatasetColumnType } from "#shared/models/dataset/DatasetColumnType";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { DateFormats } from "#shared/models/resource/sheet/column/DateFormat";
import { dayjs } from "#shared/services/dayjs";
import { BooleanValue, BooleanValues } from "@/models/resource/sheet/column/BooleanValue";
import { normalizeString } from "@esposter/shared";

export const inferColumnType = (values: string[]): DatasetColumnType => {
  const normalizedValues = values.map((value) => normalizeString(value)).filter(Boolean);
  if (normalizedValues.length === 0) return ColumnType.String;
  else if (normalizedValues.every((value) => BooleanValues.has(value.toLowerCase() as BooleanValue)))
    return ColumnType.Boolean;
  else if (normalizedValues.every((value) => !Number.isNaN(Number(value)))) return ColumnType.Number;
  else if (
    normalizedValues.every(
      (value) => Number.isNaN(Number(value)) && DateFormats.some((format) => dayjs(value, format, true).isValid()),
    )
  )
    return ColumnType.Date;
  else return ColumnType.String;
};
