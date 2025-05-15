import type { Context } from "@@/server/trpc/context";

import { transformer } from "#shared/services/trpc/transformer";
import { initTRPC } from "@trpc/server";
import { z } from "zod";
// Avoid exporting the entire t-object since it's not very
// descriptive and can be confusing to newcomers used to t
// meaning translation in i18n libraries
const t = initTRPC.context<Context>().create({
  errorFormatter: ({ error, shape }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.code === "BAD_REQUEST" && error.cause instanceof z.ZodError ? z.treeifyError(error.cause) : null,
    },
  }),
  transformer,
});

export const middleware = t.middleware;
export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
