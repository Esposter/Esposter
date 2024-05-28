import { ColumnChartType } from "@/models/dashboard/chart/column/ColumnChartType";
import { z } from "zod";

export class BasicColumnChartConfiguration {
  type: ColumnChartType.Basic = ColumnChartType.Basic;
  configuration: {
    title: string;
  } = { title: "" };
}

export const basicColumnChartConfigurationSchema = z.object({
  type: z.literal(ColumnChartType.Basic),
  configuration: z.object({
    title: z.string(),
  }),
}) satisfies z.ZodType<BasicColumnChartConfiguration>;
