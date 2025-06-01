import type { z } from "zod/v4";

import { getProfanityFilterMiddleware } from "@@/server/trpc/middleware/getProfanityFilterMiddleware";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";

export const getProfanityFilterProcedure = <T extends z.ZodType>(schema: T, keys: (keyof z.output<T>)[]) =>
  authedProcedure.use(getProfanityFilterMiddleware(schema, keys));
