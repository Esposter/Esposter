import { DATE_FORMATS } from "#shared/models/tableEditor/file/constants";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { dayjs } from "#shared/services/dayjs";
import { BOOLEAN_VALUES } from "@/services/tableEditor/file/constants";

export const inferColumnType = (values: string[]): ColumnType => {
  const trimmedValues = values.map((value) => value.trim()).filter(Boolean);
  if (trimmedValues.length === 0) return ColumnType.String;
  else if (trimmedValues.every((value) => BOOLEAN_VALUES.has(value.toLowerCase()))) return ColumnType.Boolean;
  else if (trimmedValues.every((value) => !Number.isNaN(Number(value)))) return ColumnType.Number;
  else if (
    trimmedValues.every(
      (value) => Number.isNaN(Number(value)) && DATE_FORMATS.some((format) => dayjs(value, format, true).isValid()),
    )
  )
    return ColumnType.Date;
  else return ColumnType.String;
};
