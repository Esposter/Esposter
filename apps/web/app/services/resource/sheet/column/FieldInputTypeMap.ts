import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";

export const FieldInputTypeMap = {
  [ColumnType.Number]: UiTextFieldType.Number,
  [ColumnType.String]: undefined,
} as const satisfies Record<ColumnType.Number | ColumnType.String, UiTextFieldType | undefined>;
