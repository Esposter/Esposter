import type { input, ZodObjectLike } from "zod";

import { transform } from "zod";

export const prefault = <T extends ZodObjectLike>(schema: T, value: input<T>) =>
  transform((input) => input ?? value).pipe(schema);
