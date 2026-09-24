import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { UiToken } from "@/models/ui/UiToken";

// The colour a column's type is marked in, so a glance down the column list reads which kind each one is
export const ColumnTypeTokenMap = {
  [ColumnType.Boolean]: UiToken.Success,
  [ColumnType.Computed]: UiToken.Muted,
  [ColumnType.Date]: UiToken.Warning,
  [ColumnType.Number]: UiToken.Accent,
  [ColumnType.String]: UiToken.Info,
} as const satisfies Record<ColumnType, UiToken>;
