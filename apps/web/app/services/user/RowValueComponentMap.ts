import { RowValueType } from "#src/models/user/ProfileCard/RowValueType";

export const RowValueComponentMap = {
  [RowValueType.Image]: defineAsyncComponent(() => import("#src/components/User/ProfileCard/Column/Image.vue")),
  [RowValueType.Text]: defineAsyncComponent(() => import("#src/components/User/ProfileCard/Column/Text.vue")),
  [RowValueType.Textarea]: defineAsyncComponent(() => import("#src/components/User/ProfileCard/Column/Textarea.vue")),
} as const satisfies Record<RowValueType, Component>;
