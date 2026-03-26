import { BooleanValue } from "#shared/models/tableEditor/file/column/BooleanValue";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { DateFormat } from "#shared/models/tableEditor/file/column/DateFormat";
import { dayjs } from "#shared/services/dayjs";

export const inferColumnType = (values: string[]): ColumnType => {
  const trimmedValues = values.map((value) => value.trim()).filter(Boolean);
  if (trimmedValues.length === 0) return ColumnType.String;
  else if (trimmedValues.every((value) => Object.values(BooleanValue).includes(value.toLowerCase() as BooleanValue)))
    return ColumnType.Boolean;
  else if (trimmedValues.every((value) => !Number.isNaN(Number(value)))) return ColumnType.Number;
  else if (
    trimmedValues.every(
      (value) =>
        Number.isNaN(Number(value)) && Object.values(DateFormat).some((format) => dayjs(value, format, true).isValid()),
    )
  )
    return ColumnType.Date;
  else return ColumnType.String;
};
