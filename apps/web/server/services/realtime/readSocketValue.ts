import type { z } from "zod";

import { createError } from "nuxt/server";

// A socket's path and query are the client's to choose, so each value is parsed by its schema before it names an object
export const readSocketValue = <T extends z.ZodType>(schema: T, value: unknown): z.output<T> => {
  const result = schema.safeParse(value);
  if (!result.success) throw createError({ statusCode: 400 });
  return result.data;
};
