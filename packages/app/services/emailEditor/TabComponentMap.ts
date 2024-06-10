import { EmailEditorTabType } from "@/models/emailEditor/EmailEditorTabType";

export const TabComponentMap = {
  [EmailEditorTabType.JSON]: defineAsyncComponent(() => import("@/components/EmailEditor/JSONTab.vue")),
  [EmailEditorTabType.MJML]: defineAsyncComponent(() => import("@/components/EmailEditor/MJMLTab.vue")),
  [EmailEditorTabType.Preview]: defineAsyncComponent(() => import("@/components/EmailEditor/PreviewTab.vue")),
} as const satisfies Record<EmailEditorTabType, Component>;
