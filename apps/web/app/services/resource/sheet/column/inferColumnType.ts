import type { DatasetColumnType } from "#shared/models/dataset/DatasetColumnType";

import { BooleanValue } from "#shared/models/resource/sheet/column/BooleanValue";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { DateFormats } from "#shared/models/resource/sheet/column/DateFormat";
import { parseDate } from "#shared/util/date/parseDate";
import { normalizeString } from "@esposter/shared";

const BooleanValueStrings: readonly string[] = Object.values(BooleanValue);
const isBooleanValue = (value: string): value is BooleanValue => BooleanValueStrings.includes(value);

export const inferColumnType = (values: string[]): DatasetColumnType => {
  const normalizedValues = values.map((value) => normalizeString(value)).filter(Boolean);
  if (normalizedValues.length === 0) return ColumnType.String;
  else if (normalizedValues.every((value) => isBooleanValue(value.toLowerCase()))) return ColumnType.Boolean;
  else if (normalizedValues.every((value) => !Number.isNaN(Number(value)))) return ColumnType.Number;
  else if (
    normalizedValues.every(
      (value) => Number.isNaN(Number(value)) && DateFormats.some((format) => Boolean(parseDate(value, format))),
    )
  )
    return ColumnType.Date;
  else return ColumnType.String;
};
