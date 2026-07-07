import type { ResourceType } from "@esposter/db-schema";

import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { router } from "@@/server/trpc";
import { getOwnerProcedure } from "@@/server/trpc/procedure/resource/getOwnerProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { resources, resourceTypeSchema, selectResourceSchema } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { and, count, desc, eq, ilike, inArray } from "drizzle-orm";
import { z } from "zod";

const readResourceInputSchema = selectResourceSchema.pick({ id: true });

const resourceFilterInputSchema = z.object({
  searchQuery: z.string().optional(),
  types: z.array(resourceTypeSchema).optional(),
});

const readResourcesInputSchema = z.object({
  ...createOffsetPaginationParamsSchema(selectResourceSchema.keyof()).shape,
  ...resourceFilterInputSchema.shape,
});
// Shared filter so count and readResources stay in lockstep as filters evolve
const createResourcesWhere = (userId: string, searchQuery?: string, types?: ResourceType[]) =>
  and(
    eq(resources.userId, userId),
    searchQuery ? ilike(resources.name, `%${searchQuery}%`) : undefined,
    types && types.length > 0 ? inArray(resources.type, types) : undefined,
  );

export const resourceRouter = router({
  count: standardAuthedProcedure.input(resourceFilterInputSchema.prefault({})).query(
    async ({ ctx, input: { searchQuery, types } }) =>
      takeOne(
        await ctx.db
          .select({ count: count() })
          .from(resources)
          .where(createResourcesWhere(ctx.getSessionPayload.user.id, searchQuery, types)),
      ).count,
  ),
  readResource: getOwnerProcedure(undefined, readResourceInputSchema, "id").query(({ ctx }) => ctx.resource),
  readResources: standardAuthedProcedure
    .input(readResourcesInputSchema.prefault({}))
    .query(async ({ ctx, input: { limit, offset, searchQuery, sortBy, types } }) => {
      const resultResources = await ctx.db
        .select()
        .from(resources)
        .where(createResourcesWhere(ctx.getSessionPayload.user.id, searchQuery, types))
        .orderBy(...(sortBy.length > 0 ? parseSortByToSql(resources, sortBy) : [desc(resources.updatedAt)]))
        .limit(limit + 1)
        .offset(offset);
      return getOffsetPaginationData(resultResources, limit);
    }),
});
