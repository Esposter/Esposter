import { z } from "zod";

export interface XlsxDataSourceConfiguration {
  sheetIndex: number;
}

export const xlsxDataSourceConfigurationSchema = z.object({
  sheetIndex: z.number().int().nonnegative(),
}) satisfies z.ZodType<XlsxDataSourceConfiguration>;
