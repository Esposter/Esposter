import type { Chart } from "@/models/dashboard/chart/Chart";
import type { Visual } from "@/models/dashboard/Visual";
import type { AChartConfigurationResolver } from "@/models/resolvers/dashboard/AChartConfigurationResolver";
import { VisualDataMap } from "@/services/dashboard/chart/VisualDataMap";
import type { ApexOptions } from "apexcharts";

export const resolveChartConfiguration = <T extends Chart>(
  apexOptions: ApexOptions,
  visualType: Visual["type"],
  { type, configuration }: T,
) =>
  (
    VisualDataMap[visualType].chartDataMap[type].resolver as AChartConfigurationResolver<T["configuration"]>
  ).handleConfiguration(apexOptions, configuration);
