import { BooleanValue, BooleanValues } from "#shared/models/tableEditor/file/column/BooleanValue";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { DateFormats } from "#shared/models/tableEditor/file/column/DateFormat";
import { dayjs } from "#shared/services/dayjs";

export const inferColumnType = (values: string[]): ColumnType => {
  const trimmedValues = values.map((value) => value.trim()).filter(Boolean);
  if (trimmedValues.length === 0) return ColumnType.String;
  else if (trimmedValues.every((value) => BooleanValues.has(value.toLowerCase() as BooleanValue)))
    return ColumnType.Boolean;
  else if (trimmedValues.every((value) => !Number.isNaN(Number(value)))) return ColumnType.Number;
  else if (
    trimmedValues.every(
      (value) => Number.isNaN(Number(value)) && [...DateFormats].some((format) => dayjs(value, format, true).isValid()),
    )
  )
    return ColumnType.Date;
  else return ColumnType.String;
};
