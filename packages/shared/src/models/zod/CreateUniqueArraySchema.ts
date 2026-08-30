import type { UniqueArraySchemaKey } from "#src/models/zod/UniqueArraySchemaKey";
import type { z } from "zod";

export type CreateUniqueArraySchema = (<TOutput extends object, TInput, TSchema extends z.ZodType<TOutput, TInput>>(
  schema: TSchema,
  key: UniqueArraySchemaKey<TSchema>,
) => z.ZodArray<TSchema>) &
  (<TSchema extends z.ZodType>(schema: TSchema) => z.ZodArray<TSchema>);
