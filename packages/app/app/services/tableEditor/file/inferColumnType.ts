import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { dayjs } from "#shared/services/dayjs";
import { BOOLEAN_VALUES } from "@/services/tableEditor/file/constants";

export const inferColumnType = (values: string[]): ColumnType => {
  const trimmedValues = values.map((v) => v.trim()).filter(Boolean);
  if (trimmedValues.length === 0) return ColumnType.String;
  else if (trimmedValues.every((v) => BOOLEAN_VALUES.has(v.toLowerCase()))) return ColumnType.Boolean;
  else if (trimmedValues.every((v) => !Number.isNaN(Number(v)))) return ColumnType.Number;
  else if (trimmedValues.every((v) => dayjs(v).isValid())) return ColumnType.Date;
  else return ColumnType.String;
};
