import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { router } from "@@/server/trpc";
import { getOwnerProcedure } from "@@/server/trpc/procedure/resource/getOwnerProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { resourceTypeSchema, selectResourceSchema } from "@esposter/db-schema";
import { z } from "zod";

const readResourceInputSchema = selectResourceSchema.pick({ id: true });

const readResourcesInputSchema = z.object({
  ...createOffsetPaginationParamsSchema(selectResourceSchema.keyof()).shape,
  searchQuery: z.string().optional(),
  types: z.array(resourceTypeSchema).optional(),
});

export const resourceRouter = router({
  readResource: getOwnerProcedure(undefined, readResourceInputSchema, "id").query(({ ctx }) => ctx.resource),
  readResources: standardAuthedProcedure
    .input(readResourcesInputSchema.prefault({}))
    .query(async ({ ctx, input: { limit, offset, searchQuery, sortBy, types } }) => {
      const resultResources = await ctx.db.query.resources.findMany({
        limit: limit + 1,
        offset,
        orderBy: (resources, { desc }) =>
          sortBy.length > 0 ? parseSortByToSql(resources, sortBy) : desc(resources.updatedAt),
        where: {
          ...(searchQuery
            ? {
                name: {
                  ilike: `%${searchQuery}%`,
                },
              }
            : {}),
          ...(types && types.length > 0
            ? {
                type: {
                  in: types,
                },
              }
            : {}),
          userId: {
            eq: ctx.getSessionPayload.user.id,
          },
        },
      });
      return getOffsetPaginationData(resultResources, limit);
    }),
});
