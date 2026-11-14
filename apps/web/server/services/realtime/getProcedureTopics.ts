import type { ProcedureTopics, ProcedureTopicsOptions } from "#server/models/trpc/ProcedureTopics";
import type { Topic } from "@esposter/db-schema";
import type { Except } from "type-fest";
import type { z } from "zod";

// A procedure's topics typed by its input schema. The input reached the procedure already valid, so the parse only
// Restores its type
export const getProcedureTopics =
  <TSchema extends z.ZodType>(
    schema: TSchema,
    getTopics: (input: z.output<TSchema>, options: Except<ProcedureTopicsOptions, "input">) => Topic[],
  ): ProcedureTopics =>
  ({ input, ...options }) =>
    getTopics(schema.parse(input), options);
