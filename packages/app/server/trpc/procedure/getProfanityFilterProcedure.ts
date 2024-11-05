import type { z } from "zod";

import { getProfanityFilterMiddleware } from "@/server/trpc/middleware/getProfanityFilterMiddleware";
import { authedProcedure } from "@/server/trpc/procedure/authedProcedure";

export const getProfanityFilterProcedure = <T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  keys: (keyof T["shape"] & string)[],
) => authedProcedure.use(getProfanityFilterMiddleware(schema, keys));
