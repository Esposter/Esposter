import { VisualType } from "@/models/dashboard/VisualType";

export const VisualTypeDemoIconMap = {
  [VisualType.Area]: defineAsyncComponent(() => import("@/assets/dashboard/demo/icon/Area.vue")),
  [VisualType.Bar]: defineAsyncComponent(() => import("@/assets/dashboard/demo/icon/Bar.vue")),
  [VisualType.BoxPlot]: defineAsyncComponent(() => import("@/assets/dashboard/demo/icon/BoxPlot.vue")),
  [VisualType.Bubble]: defineAsyncComponent(() => import("@/assets/dashboard/demo/icon/Bubble.vue")),
  [VisualType.Candlestick]: defineAsyncComponent(() => import("@/assets/dashboard/demo/icon/Candlestick.vue")),
  [VisualType.Column]: defineAsyncComponent(() => import("@/assets/dashboard/demo/icon/Column.vue")),
  [VisualType.Funnel]: defineAsyncComponent(() => import("@/assets/dashboard/demo/icon/Funnel.vue")),
  [VisualType.Line]: defineAsyncComponent(() => import("@/assets/dashboard/demo/icon/Line.vue")),
  [VisualType.RangeArea]: defineAsyncComponent(() => import("@/assets/dashboard/demo/icon/RangeArea.vue")),
  [VisualType.RangeBar]: defineAsyncComponent(() => import("@/assets/dashboard/demo/icon/RangeBar.vue")),
  [VisualType.Scatter]: defineAsyncComponent(() => import("@/assets/dashboard/demo/icon/Scatter.vue")),
} as const satisfies Record<VisualType, Component>;
