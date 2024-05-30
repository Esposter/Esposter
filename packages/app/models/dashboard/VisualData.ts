import type { Chart } from "@/models/dashboard/chart/Chart";
import type { ChartData } from "@/models/dashboard/chart/ChartData";

export interface VisualData<T extends Chart> {
  typeEnum: object;
  data: ChartData<T>;
}
