import type { z } from "zod";

export const saveToLocalStorage = <T>(key: string, schema: z.ZodType<T>, value: T): boolean => {
  const result = schema.safeParse(value);
  if (!result.success) return false;
  localStorage.setItem(key, JSON.stringify(result.data));
  return true;
};
