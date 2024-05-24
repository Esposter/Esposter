import { DashboardVisualType } from "@/models/dashboard/DashboardVisualType";

export const DashboardVisualTypeComponentMap = {
  [DashboardVisualType.Bar]: (await import("vue-chartjs")).Bar,
  [DashboardVisualType.Bubble]: (await import("vue-chartjs")).Bubble,
  [DashboardVisualType.Doughnut]: (await import("vue-chartjs")).Doughnut,
  [DashboardVisualType.Line]: (await import("vue-chartjs")).Line,
  [DashboardVisualType.Pie]: (await import("vue-chartjs")).Pie,
  [DashboardVisualType.PolarArea]: (await import("vue-chartjs")).PolarArea,
  [DashboardVisualType.Radar]: (await import("vue-chartjs")).Radar,
  [DashboardVisualType.Scatter]: (await import("vue-chartjs")).Scatter,
} as const satisfies Record<DashboardVisualType, Component>;
