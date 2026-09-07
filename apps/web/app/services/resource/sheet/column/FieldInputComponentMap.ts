import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import FieldInputBoolean from "@/components/Resource/Sheet/Row/Field/Input/Boolean.vue";
import FieldInputDate from "@/components/Resource/Sheet/Row/Field/Input/Date.vue";
import FieldInputText from "@/components/Resource/Sheet/Row/Field/Input/Text.vue";

export const FieldInputComponentMap = {
  [ColumnType.Boolean]: FieldInputBoolean,
  [ColumnType.Computed]: FieldInputText,
  [ColumnType.Date]: FieldInputDate,
  [ColumnType.Number]: FieldInputText,
  [ColumnType.String]: FieldInputText,
} as const satisfies Record<ColumnType, Component>;
