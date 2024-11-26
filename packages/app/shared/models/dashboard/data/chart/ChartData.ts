import type { Chart } from "@/shared/models/dashboard/data/chart/Chart";

export interface ChartData<T extends Chart["configuration"]> {
  getInitialConfiguration: () => T;
}
