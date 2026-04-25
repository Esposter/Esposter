import { z } from "zod";

export const extractSchemaFields = <T extends z.ZodObject>(schema: T, obj: object): z.infer<T> =>
  Object.fromEntries(
    Object.keys(schema.shape).map((key) => [key, (obj as Record<string, unknown>)[key]]),
  ) as z.infer<T>;
