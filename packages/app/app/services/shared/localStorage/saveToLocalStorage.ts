import { InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";

export const saveToLocalStorage = <T>(key: string, schema: z.ZodType<T>, value: T) => {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new InvalidOperationError(Operation.Update, saveToLocalStorage.name, z.prettifyError(result.error));
  localStorage.setItem(key, JSON.stringify(result.data));
};
