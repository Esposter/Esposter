import { z } from "zod";

export enum CsvDelimiter {
  Comma = ",",
  Pipe = "|",
  Semicolon = ";",
  Tab = "\t",
}

// A union of titled literals rather than `z.enum` because the values are the delimiter characters
// Themselves — a Vjsf select rendering them raw offers an unlabelled tab and three lone punctuation marks
export const csvDelimiterSchema = z.union([
  z.literal(CsvDelimiter.Comma).meta({ title: "Comma (,)" }),
  z.literal(CsvDelimiter.Pipe).meta({ title: "Pipe (|)" }),
  z.literal(CsvDelimiter.Semicolon).meta({ title: "Semicolon (;)" }),
  z.literal(CsvDelimiter.Tab).meta({ title: "Tab" }),
]) satisfies z.ZodType<CsvDelimiter>;
