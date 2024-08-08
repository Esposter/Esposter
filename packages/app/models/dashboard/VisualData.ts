import type { Chart } from "@/models/dashboard/chart/Chart";
import type { ChartData } from "@/models/dashboard/chart/ChartData";

export interface VisualData<T extends Chart> {
  chartDataMap: Record<string, ChartData<T["configuration"]>>;
  getInitialChart: () => T;
  typeEnum: object;
}
