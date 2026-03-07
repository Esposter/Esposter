import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { BOOLEAN_VALUES } from "@/services/tableEditor/file/constants";

export const inferColumnType = (values: string[]): ColumnType => {
  const trimmedValues = values.map((v) => v.trim()).filter((v) => v);
  if (trimmedValues.length === 0) return ColumnType.String;
  else if (trimmedValues.every((v) => BOOLEAN_VALUES.has(v.toLowerCase()))) return ColumnType.Boolean;
  else if (trimmedValues.every((v) => !Number.isNaN(Number(v)))) return ColumnType.Number;
  else if (trimmedValues.every((v) => !Number.isNaN(Date.parse(v)))) return ColumnType.Date;
  else return ColumnType.String;
};
