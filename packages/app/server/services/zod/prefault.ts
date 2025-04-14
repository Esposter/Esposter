import type { ZodObjectLike } from "zod";

import { transform } from "zod";

export const prefault = <TInput, TOutput, TSchema extends ZodObjectLike<TOutput, Awaited<TInput>>>(
  schema: TSchema,
  value: TInput,
) => transform<TInput | undefined>((input) => input ?? value).pipe(schema);
