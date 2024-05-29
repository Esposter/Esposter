import type { ChartConfiguration } from "@/models/dashboard/chart/ChartConfiguration";
import type { AChartConfigurationResolver } from "@/models/resolvers/dashboard/AChartConfigurationResolver";
import type { JsonSchema7Type } from "zod-to-json-schema";

export interface ChartData<T extends ChartConfiguration> {
  getInitialConfiguration: () => T;
  schema: JsonSchema7Type;
  resolver: AChartConfigurationResolver<T>;
}
