import { CsvDelimiter } from "#shared/models/tableEditor/file/CsvDelimiter";
import { z } from "zod";

export interface CsvDataSourceConfiguration {
  delimiter: CsvDelimiter;
}

export const csvDataSourceConfigurationSchema = z.object({
  delimiter: z.union([
    z.literal(CsvDelimiter.Comma).meta({ title: "Comma (,)" }),
    z.literal(CsvDelimiter.Pipe).meta({ title: "Pipe (|)" }),
    z.literal(CsvDelimiter.Semicolon).meta({ title: "Semicolon (;)" }),
    z.literal(CsvDelimiter.Tab).meta({ title: "Tab" }),
  ]),
}) satisfies z.ZodType<CsvDataSourceConfiguration>;
