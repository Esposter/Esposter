import { z } from "zod";

export enum CsvDelimiter {
  Comma = ",",
  Pipe = "|",
  Semicolon = ";",
  Tab = "\t",
}

export const csvDelimiterSchema = z.enum(CsvDelimiter) satisfies z.ZodType<CsvDelimiter>;
