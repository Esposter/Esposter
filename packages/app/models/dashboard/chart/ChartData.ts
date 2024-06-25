import type { Chart } from "@/models/dashboard/chart/Chart";

export interface ChartData<T extends Chart["configuration"]> {
  getInitialConfiguration: () => T;
}
