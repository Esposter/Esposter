import type { UniqueArraySchemaKey } from "#src/models/zod/UniqueArraySchemaKey";
import type { Primitive } from "type-fest";
import type { z } from "zod";

// The no-key overload compares items through a Set, which is reference equality, so it is closed to object
// Output — two structurally equal objects are separate references and would pass as unique
export type CreateUniqueArraySchema = (<TOutput extends object, TInput, TSchema extends z.ZodType<TOutput, TInput>>(
  schema: TSchema,
  key: UniqueArraySchemaKey<TSchema>,
) => z.ZodArray<TSchema>) &
  (<TOutput extends Primitive, TInput, TSchema extends z.ZodType<TOutput, TInput>>(
    schema: TSchema,
  ) => z.ZodArray<TSchema>);
