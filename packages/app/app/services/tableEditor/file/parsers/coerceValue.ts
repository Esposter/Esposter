import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { BOOLEAN_VALUES } from "@/services/tableEditor/file/constants";

export const coerceValue = (raw: string, type: ColumnType): boolean | null | number | string => {
  if (raw.trim() === "") return null;
  else if (type === ColumnType.Boolean) return BOOLEAN_VALUES.has(raw.toLowerCase());
  else if (type === ColumnType.Number) return Number(raw);
  else return raw;
};
