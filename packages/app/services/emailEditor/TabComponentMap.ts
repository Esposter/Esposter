import { EmailEditorTabType } from "@/models/emailEditor/EmailEditorTabType";

export const TabComponentMap = {
  [EmailEditorTabType.Mjml]: defineAsyncComponent(() => import("@/components/EmailEditor/MjmlTab.vue")),
  [EmailEditorTabType.Preview]: defineAsyncComponent(() => import("@/components/EmailEditor/PreviewTab.vue")),
} as const satisfies Record<EmailEditorTabType, Component>;
