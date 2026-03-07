import { z } from "zod";

export interface XlsxDataSourceConfiguration {
  sheetIndex: number;
}

export const xlsxDataSourceConfigurationSchema = z.object({
  sheetIndex: z.number().int().min(0).meta({ title: "Sheet Index" }),
}) satisfies z.ZodType<XlsxDataSourceConfiguration>;
