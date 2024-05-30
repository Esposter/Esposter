import type { Chart } from "@/models/dashboard/chart/Chart";
import type { Visual } from "@/models/dashboard/Visual";
import type { AChartConfigurationResolver } from "@/models/resolvers/dashboard/AChartConfigurationResolver";
import { VisualDataMap } from "@/services/dashboard/chart/VisualDataMap";
import type { ApexOptions } from "apexcharts";

export const resolveChartConfiguration = <T extends Chart["configuration"]>(
  apexOptions: ApexOptions,
  visualType: Visual["type"],
  configuration: T,
) =>
  (VisualDataMap[visualType].data.resolver as AChartConfigurationResolver<T>).handleConfiguration(
    apexOptions,
    configuration,
  );
