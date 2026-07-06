import type { DocumentType } from "@esposter/db-schema";
import type { z } from "zod";

import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { TRPCError } from "@trpc/server";

export const getOwnerProcedure = <T extends z.ZodType>(
  type: DocumentType,
  schema: T,
  documentIdKey: keyof z.infer<T>,
) =>
  standardAuthedProcedure.input(schema).use(async ({ ctx, input, next }) => {
    const documentId = (input as z.infer<T>)[documentIdKey];
    if (typeof documentId !== "string") throw new TRPCError({ code: "BAD_REQUEST" });

    const document = await ctx.db.query.documents.findFirst({
      where: {
        id: {
          eq: documentId,
        },
        type: {
          eq: type,
        },
        userId: {
          eq: ctx.getSessionPayload.user.id,
        },
      },
    });
    if (!document) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next({ ctx: { document } });
  });
