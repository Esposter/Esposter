import { BooleanValue, BooleanValues } from "#shared/models/tableEditor/file/column/BooleanValue";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { DateFormats } from "#shared/models/tableEditor/file/column/DateFormat";
import { dayjs } from "#shared/services/dayjs";
import { normalizeString } from "@esposter/shared";

export const inferColumnType = (values: string[]): ColumnType => {
  const normalizedValues = values.map((value) => normalizeString(value)).filter(Boolean);
  if (normalizedValues.length === 0) return ColumnType.String;
  else if (normalizedValues.every((value) => BooleanValues.has(value.toLowerCase() as BooleanValue)))
    return ColumnType.Boolean;
  else if (normalizedValues.every((value) => !Number.isNaN(Number(value)))) return ColumnType.Number;
  else if (
    normalizedValues.every(
      (value) => Number.isNaN(Number(value)) && [...DateFormats].some((format) => dayjs(value, format, true).isValid()),
    )
  )
    return ColumnType.Date;
  else return ColumnType.String;
};
