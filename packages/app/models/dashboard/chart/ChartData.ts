import type { Chart } from "@/models/dashboard/chart/Chart";
import type { JSONSchema } from "@/models/jsonSchema/JSONSchema";
import type { AChartConfigurationResolver } from "@/models/resolvers/dashboard/AChartConfigurationResolver";

export interface ChartData<T extends Chart["configuration"]> {
  getInitialConfiguration: () => T;
  schema: JSONSchema<T>;
  resolver: AChartConfigurationResolver<T>;
}
