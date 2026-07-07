import type { ResourceType } from "@esposter/db-schema";
import type { z } from "zod";

import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { TRPCError } from "@trpc/server";

// Pass undefined as the type for cross-type procedures (e.g. the explorer's readResource)
export const getOwnerProcedure = <T extends z.ZodType>(
  type: ResourceType | undefined,
  schema: T,
  resourceIdKey: keyof z.infer<T>,
) =>
  standardAuthedProcedure.input(schema).use(async ({ ctx, input, next }) => {
    const resourceId = (input as z.infer<T>)[resourceIdKey];
    if (typeof resourceId !== "string") throw new TRPCError({ code: "BAD_REQUEST" });

    const resource = await ctx.db.query.resources.findFirst({
      where: {
        id: {
          eq: resourceId,
        },
        ...(type === undefined
          ? {}
          : {
              type: {
                eq: type,
              },
            }),
        userId: {
          eq: ctx.getSessionPayload.user.id,
        },
      },
    });
    if (!resource) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next({ ctx: { resource } });
  });
