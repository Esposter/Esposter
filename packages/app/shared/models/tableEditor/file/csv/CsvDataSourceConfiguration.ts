import { CsvDelimiter } from "#shared/models/tableEditor/file/csv/CsvDelimiter";
import { z } from "zod";

export interface CsvDataSourceConfiguration {
  delimiter: CsvDelimiter;
}

export const csvDataSourceConfigurationSchema = z.object({
  delimiter: z.union([
    z.literal(CsvDelimiter.Comma).describe("Comma (,)"),
    z.literal(CsvDelimiter.Pipe).describe("Pipe (|)"),
    z.literal(CsvDelimiter.Semicolon).describe("Semicolon (;)"),
    z.literal(CsvDelimiter.Tab).describe("Tab"),
  ]),
}) satisfies z.ZodType<CsvDataSourceConfiguration>;
