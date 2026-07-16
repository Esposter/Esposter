import type { ResourceTypeCount } from "#shared/models/resource/ResourceTypeCount";
import type { Context } from "@@/server/trpc/context";
import type { Resource } from "@esposter/db-schema";

import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { escapeLike } from "@@/server/services/db/escapeLike";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { getContentBlobName } from "@@/server/services/resource/getContentBlobName";
import { router } from "@@/server/trpc";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { getOwnerProcedure } from "@@/server/trpc/procedure/resource/getOwnerProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { RestError } from "@azure/storage-blob";
import { copyBlob, deleteDirectory } from "@esposter/db";
import {
  AzureContainer,
  DatabaseEntityType,
  RESOURCE_NAME_MAX_LENGTH,
  resourcePublications,
  resources,
  resourceTypeSchema,
  selectResourceSchema,
} from "@esposter/db-schema";
import { createUniqueArraySchema, getResultAsync, MAX_READ_LIMIT, noop, Operation, takeOne } from "@esposter/shared";
import { and, count, desc, eq, exists, gte, ilike, inArray, lte, notExists } from "drizzle-orm";
import { z } from "zod";

const readResourceInputSchema = selectResourceSchema.pick({ id: true });

const resourceFilterInputSchema = z.object({
  isPublished: z.boolean().optional(),
  searchQuery: z.string().optional(),
  types: z.array(resourceTypeSchema).optional(),
  updatedAfter: z.date().optional(),
  updatedBefore: z.date().optional(),
});

type ResourceFilterInput = z.infer<typeof resourceFilterInputSchema>;

const readResourcesInputSchema = z.object({
  ...createOffsetPaginationParamsSchema(selectResourceSchema.keyof()).shape,
  ...resourceFilterInputSchema.shape,
});

const deleteResourcesInputSchema = z.object({
  ids: createUniqueArraySchema(selectResourceSchema.shape.id).min(1).max(MAX_READ_LIMIT),
});
// Appended to a duplicated resource's name; the base name is truncated so the whole stays within the length check
const duplicateNameSuffix = " (copy)";
// Shared filter so count and readResources stay in lockstep as filters evolve
const createResourcesWhere = (
  db: Context["db"],
  userId: string,
  { isPublished, searchQuery, types, updatedAfter, updatedBefore }: ResourceFilterInput,
) => {
  // A publication row exists iff the resource is currently published
  const publicationExists = db
    .select()
    .from(resourcePublications)
    .where(eq(resourcePublications.resourceId, resources.id));
  return and(
    eq(resources.userId, userId),
    searchQuery ? ilike(resources.name, `%${escapeLike(searchQuery)}%`) : undefined,
    types && types.length > 0 ? inArray(resources.type, types) : undefined,
    isPublished === undefined ? undefined : isPublished ? exists(publicationExists) : notExists(publicationExists),
    updatedAfter ? gte(resources.updatedAt, updatedAfter) : undefined,
    updatedBefore ? lte(resources.updatedAt, updatedBefore) : undefined,
  );
};

export const resourceRouter = router({
  count: standardAuthedProcedure.input(resourceFilterInputSchema.prefault({})).query(
    async ({ ctx, input }) =>
      takeOne(
        await ctx.db
          .select({ count: count() })
          .from(resources)
          .where(createResourcesWhere(ctx.db, ctx.getSessionPayload.user.id, input)),
      ).count,
  ),
  // The summary cards own the type breakdown, so `types` is the one filter they cannot pass — a card is
  // The affordance for setting it. Behind the same createResourcesWhere, so the cards can never disagree
  // With the list they navigate into
  countsByType: standardAuthedProcedure
    .input(resourceFilterInputSchema.omit({ types: true }).prefault({}))
    .query<ResourceTypeCount[]>(({ ctx, input }) =>
      ctx.db
        .select({ count: count(), type: resources.type })
        .from(resources)
        .where(createResourcesWhere(ctx.db, ctx.getSessionPayload.user.id, input))
        .groupBy(resources.type)
        .orderBy(desc(count())),
    ),
  deleteResources: standardAuthedProcedure
    .input(deleteResourcesInputSchema)
    .mutation<Resource[]>(async ({ ctx, input: { ids } }) => {
      // Owner-scoped where so callers can only ever delete their own rows; publications cascade
      const deletedResources = await ctx.db
        .delete(resources)
        .where(and(eq(resources.userId, ctx.getSessionPayload.user.id), inArray(resources.id, ids)))
        .returning();
      const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
      // The rows are already gone, so blob cleanup is best-effort — a storage hiccup must not report the delete as failed
      await Promise.all(
        deletedResources.map(({ id }) =>
          getResultAsync(() => deleteDirectory(containerClient, id, true)).match(noop, console.error),
        ),
      );
      return deletedResources;
    }),
  duplicateResource: getOwnerProcedure(undefined, readResourceInputSchema, "id").mutation<Resource>(async ({ ctx }) => {
    const { name, type, userId } = ctx.resource;
    const newResource = requireMutation(
      (
        await ctx.db
          .insert(resources)
          .values({
            name: `${name.slice(0, RESOURCE_NAME_MAX_LENGTH - duplicateNameSuffix.length)}${duplicateNameSuffix}`,
            type,
            userId,
          })
          .returning()
      )[0],
      Operation.Create,
      DatabaseEntityType.Resource,
      ctx.resource.id,
    );
    // A copy starts as Draft, so only the draft content blob is copied — never the publication.
    // Copying server-side within the same container avoids round-tripping the content through this process.
    const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
    await getResultAsync(() =>
      copyBlob(
        containerClient,
        `${containerClient.url}/${getContentBlobName(ctx.resource.id)}`,
        getContentBlobName(newResource.id),
      ),
    ).match(noop, async (error) => {
      // The blob is written on first save, so a missing source just means there is no content to copy yet
      if (error instanceof RestError && error.statusCode === 404) return;
      // Never leave a content-less orphan copy behind when the blob copy fails
      await ctx.db.delete(resources).where(eq(resources.id, newResource.id));
      throw error;
    });
    return newResource;
  }),
  readResource: getOwnerProcedure(undefined, readResourceInputSchema, "id").query(({ ctx }) => ctx.resource),
  readResources: standardAuthedProcedure
    .input(readResourcesInputSchema.prefault({}))
    .query(async ({ ctx, input: { limit, offset, sortBy, ...filter } }) => {
      const resultResources = await ctx.db
        .select()
        .from(resources)
        .where(createResourcesWhere(ctx.db, ctx.getSessionPayload.user.id, filter))
        .orderBy(
          // Relevance ladder: prefix matches rank above the remaining substring matches (true sorts before
          // False under desc), then newest-first within each tier; the prefix is bound through the query builder
          ...(filter.searchQuery ? [desc(ilike(resources.name, `${escapeLike(filter.searchQuery)}%`))] : []),
          ...(sortBy.length > 0 ? parseSortByToSql(resources, sortBy) : [desc(resources.updatedAt)]),
        )
        .limit(limit + 1)
        .offset(offset);
      return getOffsetPaginationData(resultResources, limit);
    }),
});
