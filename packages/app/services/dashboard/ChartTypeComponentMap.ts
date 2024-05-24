import { ChartType } from "@/models/dashboard/ChartType";

export const ChartTypeComponentMap = {
  [ChartType.Bar]: (await import("vue-chartjs")).Bar,
  [ChartType.Bubble]: (await import("vue-chartjs")).Bubble,
  [ChartType.Doughnut]: (await import("vue-chartjs")).Doughnut,
  [ChartType.Line]: (await import("vue-chartjs")).Line,
  [ChartType.Pie]: (await import("vue-chartjs")).Pie,
  [ChartType.PolarArea]: (await import("vue-chartjs")).PolarArea,
  [ChartType.Radar]: (await import("vue-chartjs")).Radar,
  [ChartType.Scatter]: (await import("vue-chartjs")).Scatter,
} as const satisfies Record<ChartType, Component>;
