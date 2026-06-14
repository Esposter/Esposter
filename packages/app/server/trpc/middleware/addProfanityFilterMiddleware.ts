import type { ProcedureBuilder } from "@trpc/server/unstable-core-do-not-import";

import { profanity } from "@2toad/profanity";
import { TRPCError } from "@trpc/server";

export const addProfanityFilterMiddleware = <
  TContext,
  TMeta,
  TContextOverrides,
  TInputIn,
  TInputOut,
  TOutputIn,
  TOutputOut,
  TCaller extends boolean,
>(
  procedure: ProcedureBuilder<TContext, TMeta, TContextOverrides, TInputIn, TInputOut, TOutputIn, TOutputOut, TCaller>,
  keys: (keyof TInputOut)[],
) =>
  procedure.use(({ input, next }) => {
    for (const key of keys) {
      const value = input[key];
      if (value === null || value === undefined || value === "") continue;
      else if (typeof value !== "string") throw new TRPCError({ code: "BAD_REQUEST" });
      else if (profanity.exists(value))
        throw new TRPCError({ code: "BAD_REQUEST", message: `${key.toString()} contains profanity.` });
    }
    return next();
  });
