import { DashboardVisualType } from "@/models/dashboard/DashboardVisualType";

export const DashboardVisualTypeDemoComponentMap = {
  [DashboardVisualType.Area]: defineAsyncComponent(() => import("@/assets/dashboard/demo/Area.vue")),
  [DashboardVisualType.Column]: defineAsyncComponent(() => import("@/assets/dashboard/demo/Column.vue")),
  [DashboardVisualType.Line]: defineAsyncComponent(() => import("@/assets/dashboard/demo/Line.vue")),
} as const satisfies Record<DashboardVisualType, Component>;
