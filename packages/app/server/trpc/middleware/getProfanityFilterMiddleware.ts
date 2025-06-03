import type { z } from "zod/v4";

import { profanityMatcher } from "#shared/services/obscenity/profanityMatcher";
import { middleware } from "@@/server/trpc";
import { TRPCError } from "@trpc/server";

export const getProfanityFilterMiddleware = <T extends z.ZodType>(schema: T, keys: (keyof z.output<T>)[]) =>
  middleware(async ({ getRawInput, next }) => {
    const rawInput = await getRawInput();
    const result = schema.safeParse(rawInput);
    if (!result.success) throw new TRPCError({ code: "BAD_REQUEST" });

    for (const key of keys) {
      const value = result.data[key];
      if (!value) continue;
      else if (typeof value !== "string") throw new TRPCError({ code: "BAD_REQUEST" });
      else if (profanityMatcher.hasMatch(value))
        throw new TRPCError({ code: "BAD_REQUEST", message: `${key.toString()} contains profanity: ${value}.` });
    }

    return next();
  });
