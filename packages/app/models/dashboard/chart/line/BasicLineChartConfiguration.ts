import { LineChartType } from "@/models/dashboard/chart/line/LineChartType";
import { z } from "zod";

export class BasicLineChartConfiguration {
  type: LineChartType.Basic = LineChartType.Basic;
  configuration: {
    title: string;
  } = { title: "" };
}

export const basicLineChartConfigurationSchema = z.object({
  type: z.literal(LineChartType.Basic),
  configuration: z.object({
    title: z.string(),
  }),
}) satisfies z.ZodType<BasicLineChartConfiguration>;
