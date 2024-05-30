import { z } from "zod";

export class DataLabelsLineChartConfiguration {
  title = "";
}

export const dataLabelsLineChartConfigurationSchema = z.object({
  title: z.string(),
}) satisfies z.ZodType<DataLabelsLineChartConfiguration>;
