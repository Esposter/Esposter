import type { Type } from "arktype";

import { profanityMatcher } from "#shared/services/obscenity/profanityMatcher";
import { middleware } from "@@/server/trpc";
import { TRPCError } from "@trpc/server";

export const getProfanityFilterMiddleware = <T extends Type<object>>(
  schema: T,
  keys: (keyof T["inferIn"] & string)[],
) =>
  middleware(async ({ getRawInput, next }) => {
    const rawInput = await getRawInput();
    if (!schema.allows(rawInput)) throw new TRPCError({ code: "BAD_REQUEST" });

    for (const key of keys) {
      const value = rawInput[key];
      if (typeof value !== "string" || profanityMatcher.hasMatch(value))
        throw new TRPCError({ code: "BAD_REQUEST", message: `${key} contains profanity: ${value}.` });
    }

    return next();
  });
