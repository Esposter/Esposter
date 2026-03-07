import { CsvDelimiter } from "#shared/models/tableEditor/file/csv/CsvDelimiter";
import { z } from "zod";

export interface CsvDataSourceConfiguration {
  delimiter: CsvDelimiter;
}

export const csvDataSourceConfigurationSchema = z.object({
  delimiter: z.enum(CsvDelimiter),
}) satisfies z.ZodType<CsvDataSourceConfiguration>;
