import type { Visual } from "@/models/dashboard/Visual";
import type { AChartConfigurationResolver } from "@/models/resolvers/dashboard/AChartConfigurationResolver";
import { VisualTypeChartDataMap } from "@/services/dashboard/chart/VisualTypeChartDataMap";
import type { ApexOptions } from "apexcharts";

export const resolveConfiguration = <T extends Visual["configuration"]>(
  apexOptions: ApexOptions,
  visualType: Visual["type"],
  configuration: T,
) =>
  (VisualTypeChartDataMap[visualType].resolver as AChartConfigurationResolver<T>).handleConfiguration(
    apexOptions,
    configuration,
  );
