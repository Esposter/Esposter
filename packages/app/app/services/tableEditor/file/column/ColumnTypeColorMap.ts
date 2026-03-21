import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";

export const ColumnTypeColorMap = {
  [ColumnType.Boolean]: "success",
  [ColumnType.Date]: "warning",
  [ColumnType.Number]: "primary",
  [ColumnType.String]: "info",
} as const satisfies Record<ColumnType, string | undefined>;
