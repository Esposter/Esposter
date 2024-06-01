import type { Chart } from "@/models/dashboard/chart/Chart";
import type { ChartData } from "@/models/dashboard/chart/ChartData";
import type { Visual } from "@/models/dashboard/Visual";
import { VisualDataMap } from "@/services/dashboard/chart/VisualDataMap";
import type { ApexOptions } from "apexcharts";

export const resolveChartConfiguration = <T extends Chart>(
  apexOptions: ApexOptions,
  visualType: Visual["type"],
  { type, configuration }: T,
) => {
  const { resolver } = VisualDataMap[visualType].chartDataMap[type] as ChartData<T["configuration"]>;
  resolver.handleBaseConfiguration(apexOptions, configuration);
  return resolver.handleConfiguration(apexOptions, configuration);
};
