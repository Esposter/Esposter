import { z } from "zod";

export type CreateUniqueArraySchema = (<TOutput extends object, TInput, TSchema extends z.ZodType<TOutput, TInput>>(
  schema: TSchema,
  key: UniqueArraySchemaKey<TSchema>,
) => z.ZodArray<TSchema>) &
  (<TSchema extends z.ZodType>(schema: TSchema) => z.ZodArray<TSchema>);

export type UniqueArraySchemaKey<TSchema extends z.ZodType> = TSchema extends z.ZodObject
  ? keyof TSchema["shape"] & string
  : keyof z.output<TSchema> & string;

export const createUniqueArraySchema: CreateUniqueArraySchema = <TSchema extends z.ZodType>(
  schema: TSchema,
  key?: string,
): z.ZodArray<TSchema> =>
  schema
    .array()
    .refine(
      (array) =>
        new Set<unknown>(key === undefined ? array : array.map((item) => (item as Record<string, unknown>)[key]))
          .size === array.length,
      "Array items must be unique",
    );
