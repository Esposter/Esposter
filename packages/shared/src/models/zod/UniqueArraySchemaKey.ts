import type { z } from "zod";

export type UniqueArraySchemaKey<TSchema extends z.ZodType> = TSchema extends z.ZodObject
  ? keyof TSchema["shape"] & string
  : keyof z.output<TSchema> & string;
