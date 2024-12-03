import type { z } from "zod";

import { profanityMatcher } from "#shared/services/obscenity/profanityMatcher";
import { middleware } from "@@/server/trpc";
import { TRPCError } from "@trpc/server";

export const getProfanityFilterMiddleware = <T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  keys: (keyof T["shape"] & string)[],
) =>
  middleware(async ({ getRawInput, next }) => {
    const rawInput = getRawInput();
    const result = schema.safeParse(rawInput);
    if (!result.success) throw new TRPCError({ code: "BAD_REQUEST" });

    for (const key of keys) {
      const value = result.data[key];
      if (typeof value !== "string" || profanityMatcher.hasMatch(value))
        throw new TRPCError({ code: "BAD_REQUEST", message: `${key} contains profanity: ${value}` });
    }

    return next();
  });
