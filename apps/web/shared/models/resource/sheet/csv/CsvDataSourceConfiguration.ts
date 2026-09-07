import type { CsvDelimiter } from "#shared/models/resource/sheet/csv/CsvDelimiter";

import { csvDelimiterSchema } from "#shared/models/resource/sheet/csv/CsvDelimiter";
import { z } from "zod";

export interface CsvDataSourceConfiguration {
  delimiter: CsvDelimiter;
}

export const csvDataSourceConfigurationSchema = z.object({
  delimiter: csvDelimiterSchema,
}) satisfies z.ZodType<CsvDataSourceConfiguration>;
