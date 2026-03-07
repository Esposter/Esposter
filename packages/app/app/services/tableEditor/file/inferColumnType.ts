import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { BOOLEAN_VALUES } from "@/services/tableEditor/file/constants";

export const inferColumnType = (values: string[]): ColumnType => {
  const nonEmptyValues = values.filter((v) => v.trim());
  if (nonEmptyValues.length === 0) return ColumnType.String;
  else if (nonEmptyValues.every((v) => BOOLEAN_VALUES.has(v.toLowerCase()))) return ColumnType.Boolean;
  else if (nonEmptyValues.every((v) => !Number.isNaN(Number(v)))) return ColumnType.Number;
  else if (nonEmptyValues.every((v) => !Number.isNaN(Date.parse(v)))) return ColumnType.Date;
  else return ColumnType.String;
};
