import { z } from "zod";

export const prefault = <TInput, TOutput, TSchema extends z.ZodObjectLike<TOutput, Awaited<TInput>>>(
  schema: TSchema,
  value: TInput,
): z.ZodPipe<z.ZodTransform<Awaited<TInput> | undefined, TInput | undefined>, TSchema> =>
  z.transform<TInput | undefined>((input) => input ?? value).pipe(schema);
