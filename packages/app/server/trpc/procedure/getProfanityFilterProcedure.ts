import type { Type } from "arktype";

import { getProfanityFilterMiddleware } from "@@/server/trpc/middleware/getProfanityFilterMiddleware";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";

export const getProfanityFilterProcedure = <T extends Type<object>>(schema: T, keys: (keyof T["inferIn"] & string)[]) =>
  authedProcedure.use(getProfanityFilterMiddleware(schema, keys));
