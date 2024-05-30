import type { Chart } from "@/models/dashboard/chart/Chart";
import type { AChartConfigurationResolver } from "@/models/resolvers/dashboard/AChartConfigurationResolver";
import type { JsonSchema7Type } from "zod-to-json-schema";

export interface ChartData<T extends Chart> {
  getInitialChart: () => T;
  schema: JsonSchema7Type;
  resolver: AChartConfigurationResolver<T["configuration"]>;
}
