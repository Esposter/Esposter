import { AreaChartType } from "@/models/dashboard/chart/area/AreaChartType";
import { z } from "zod";

export class BasicAreaChartConfiguration {
  type: AreaChartType.Basic = AreaChartType.Basic;
  configuration: {
    title: string;
  } = { title: "" };
}

export const basicAreaChartConfigurationSchema = z.object({
  type: z.literal(AreaChartType.Basic),
  configuration: z.object({
    title: z.string(),
  }),
}) satisfies z.ZodType<BasicAreaChartConfiguration>;
