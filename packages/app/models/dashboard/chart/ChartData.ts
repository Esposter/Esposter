import type { ChartConfiguration } from "@/models/dashboard/chart/ChartConfiguration";
import type { JsonSchema7Type } from "zod-to-json-schema";

export interface ChartData {
  getInitialConfiguration: () => ChartConfiguration;
  schema: JsonSchema7Type;
}
