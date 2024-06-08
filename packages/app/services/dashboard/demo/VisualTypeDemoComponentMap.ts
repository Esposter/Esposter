import { VisualType } from "@/models/dashboard/VisualType";

export const VisualTypeDemoComponentMap = {
  [VisualType.Area]: defineAsyncComponent(() => import("@/assets/dashboard/demo/Area.vue")),
  [VisualType.Bar]: defineAsyncComponent(() => import("@/assets/dashboard/demo/Bar.vue")),
  [VisualType.Column]: defineAsyncComponent(() => import("@/assets/dashboard/demo/Column.vue")),
  [VisualType.Line]: defineAsyncComponent(() => import("@/assets/dashboard/demo/Line.vue")),
} as const satisfies Record<VisualType, Component>;
