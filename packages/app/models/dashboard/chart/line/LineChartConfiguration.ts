import { LineChartType, lineChartTypeSchema } from "@/models/dashboard/chart/line/LineChartType";
import { z } from "zod";

export class LineChartConfiguration {
  type = LineChartType.Basic;
}

export const lineChartConfigurationSchema = z.object({
  type: lineChartTypeSchema,
}) satisfies z.ZodType<LineChartConfiguration>;
