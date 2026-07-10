import { ColumnType } from "#shared/models/resource/file/column/ColumnType";
import FieldInputBoolean from "@/components/Resource/File/Row/Field/Input/Boolean.vue";
import FieldInputDate from "@/components/Resource/File/Row/Field/Input/Date.vue";
import FieldInputText from "@/components/Resource/File/Row/Field/Input/Text.vue";

export const FieldInputComponentMap = {
  [ColumnType.Boolean]: FieldInputBoolean,
  [ColumnType.Computed]: FieldInputText,
  [ColumnType.Date]: FieldInputDate,
  [ColumnType.Number]: FieldInputText,
  [ColumnType.String]: FieldInputText,
} as const satisfies Record<ColumnType, Component>;
