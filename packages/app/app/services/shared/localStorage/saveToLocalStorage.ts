import type { ZodType } from "zod";

export const saveToLocalStorage = <T>(key: string, schema: ZodType<T>, value: T): void => {
  const result = schema.safeParse(value);
  if (!result.success) return;
  localStorage.setItem(key, JSON.stringify(result.data));
};
