import type { z } from "zod/v4";

import { getProfanityFilterMiddleware } from "@@/server/trpc/middleware/getProfanityFilterMiddleware";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";

export const getProfanityFilterProcedure = <T>(schema: z.ZodType<T>, keys: (keyof T & string)[]) =>
  authedProcedure.use(getProfanityFilterMiddleware(schema, keys));
