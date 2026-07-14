import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";

export const FieldInputTypeMap = {
  [ColumnType.Number]: "number",
  [ColumnType.String]: "text",
} as const satisfies Record<ColumnType.Number | ColumnType.String, string>;
