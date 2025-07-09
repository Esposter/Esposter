import type { inferParser } from "@trpc/server/unstable-core-do-not-import";
import type { z } from "zod";

import { addProfanityFilterMiddleware } from "@@/server/trpc/middleware/addProfanityFilterMiddleware";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";

export const getProfanityFilterProcedure = <T extends z.ZodType>(schema: T, keys: (keyof inferParser<T>["out"])[]) =>
  addProfanityFilterMiddleware(authedProcedure.input(schema), keys);
