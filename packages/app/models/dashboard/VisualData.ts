import type { Chart } from "@/shared/models/dashboard/data/chart/Chart";
import type { ChartData } from "@/shared/models/dashboard/data/chart/ChartData";

export interface VisualData<T extends Chart> {
  chartDataMap: Record<string, ChartData<T["configuration"]>>;
  getInitialChart: () => T;
  typeEnum: object;
}
