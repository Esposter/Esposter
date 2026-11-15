import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";

export const FieldInputTypeMap = {
  [ColumnType.Number]: UiTextFieldType.Number,
  [ColumnType.String]: undefined,
} as const satisfies Record<typeof ColumnType.Number | typeof ColumnType.String, UiTextFieldType | undefined>;
