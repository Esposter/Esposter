import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";

export const FieldInputTypeMap = {
  [ColumnType.Number]: "number",
  [ColumnType.String]: "text",
} as const satisfies Record<Exclude<ColumnType, ColumnType.Boolean | ColumnType.Date>, string>;
