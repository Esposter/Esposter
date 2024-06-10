import { VisualType } from "@/models/dashboard/VisualType";

export const VisualTypeDemoComponentMap = {
  [VisualType.Area]: defineAsyncComponent(() => import("@/assets/dashboard/demo/Area.vue")),
  [VisualType.Bar]: defineAsyncComponent(() => import("@/assets/dashboard/demo/Bar.vue")),
  [VisualType.Column]: defineAsyncComponent(() => import("@/assets/dashboard/demo/Column.vue")),
  [VisualType.Funnel]: defineAsyncComponent(() => import("@/assets/dashboard/demo/Funnel.vue")),
  [VisualType.Line]: defineAsyncComponent(() => import("@/assets/dashboard/demo/Line.vue")),
  [VisualType.RangeArea]: defineAsyncComponent(() => import("@/assets/dashboard/demo/RangeArea.vue")),
  [VisualType.RangeBar]: defineAsyncComponent(() => import("@/assets/dashboard/demo/RangeBar.vue")),
} as const satisfies Record<VisualType, Component>;
