import type { createTypedChart } from "vue-chartjs";

type TypedChartComponent = ReturnType<typeof createTypedChart>;

export interface DashboardVisualData {
  data: InstanceType<TypedChartComponent>["data"];
  options?: InstanceType<TypedChartComponent>["options"];
}
