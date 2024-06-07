import { EmailEditorTab } from "@/models/emailEditor/EmailEditorTab";

export const TabComponentMap = {
  [EmailEditorTab.Mjml]: defineAsyncComponent(() => import("@/components/EmailEditor/MjmlTab.vue")),
  [EmailEditorTab.Preview]: defineAsyncComponent(() => import("@/components/EmailEditor/PreviewTab.vue")),
} as const satisfies Record<EmailEditorTab, Component>;
