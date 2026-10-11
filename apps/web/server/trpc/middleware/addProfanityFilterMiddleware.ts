import type { ProcedureBuilder } from "@trpc/server/unstable-core-do-not-import";

import { checkContainsProfanity } from "@esposter/shared";
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
  keys: (keyof TInputOut & string)[],
) =>
  procedure.use(({ input, next }) => {
    for (const key of keys) {
      const value = input[key];
      if (value === null || value === undefined || value === "") continue;
      else if (typeof value !== "string")
        throw new TRPCError({ code: "BAD_REQUEST", message: `${key} must be a string.` });
      else if (checkContainsProfanity(value))
        throw new TRPCError({ code: "BAD_REQUEST", message: `${key} contains profanity.` });
    }
    return next();
  });
