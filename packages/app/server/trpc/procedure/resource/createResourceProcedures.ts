import type { PublishableResourceType } from "#shared/models/resource/PublishableResourceType";
import type { PublishableResourceProcedureOptions } from "@@/server/models/resource/PublishableResourceProcedureOptions";
import type { Resource, ResourceType } from "@esposter/db-schema";

import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { getIsPublishable } from "#shared/services/resource/getIsPublishable";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { getContentBlobName } from "@@/server/services/resource/getContentBlobName";
import { getPublishedContentBlobName } from "@@/server/services/resource/getPublishedContentBlobName";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { getOwnerProcedure } from "@@/server/trpc/procedure/resource/getOwnerProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";
import { deleteDirectory } from "@esposter/db";
import { AzureContainer, DatabaseEntityType, resources, selectResourceSchema } from "@esposter/db-schema";
import { getResultAsync, InvalidOperationError, jsonDateParse, Operation, streamToText } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

const readResourcesInputSchema = createOffsetPaginationParamsSchema(selectResourceSchema.keyof()).prefault({});

const createResourceInputSchema = selectResourceSchema.pick({ name: true });

const updateResourceInputSchema = selectResourceSchema.pick({ id: true, name: true });

const resourceIdInputSchema = selectResourceSchema.pick({ id: true });

type ResourceContent<TType extends ResourceType> = z.infer<(typeof ResourceDefinitionMap)[TType]["contentSchema"]>;

export const createResourceProcedures = <TType extends ResourceType>(
  type: TType,
  ...args: TType extends PublishableResourceType
    ? [options?: PublishableResourceProcedureOptions<ResourceContent<TType>>]
    : []
) => {
  const { contentSchema } = ResourceDefinitionMap[type];
  const { transformPublishedContent, transformReadContent } = args[0] ?? {};
  // Annotated so the generic content schema resolves to a concrete type for destructuring.
  // Both the output and input sides are declared — leaving the input side defaulted to unknown
  // Would erase the procedure's input type for consumers like achievement condition paths.
  const saveResourceContentInputSchema = z.object({
    content: contentSchema,
    contentVersion: selectResourceSchema.shape.contentVersion,
    id: selectResourceSchema.shape.id,
  }) as unknown as z.ZodType<
    { content: ResourceContent<TType>; contentVersion: Resource["contentVersion"]; id: Resource["id"] },
    {
      content: z.input<(typeof ResourceDefinitionMap)[TType]["contentSchema"]>;
      contentVersion: Resource["contentVersion"];
      id: Resource["id"];
    }
  >;
  const readContent = (id: Resource["id"]): Promise<ResourceContent<TType> | undefined> =>
    getResultAsync(async () => {
      const { readableStreamBody } = await useDownload(AzureContainer.ResourceAssets, getContentBlobName(id));
      if (!readableStreamBody) return undefined;
      return contentSchema.parse(jsonDateParse(await streamToText(readableStreamBody))) as ResourceContent<TType>;
    })
      .orTee(console.error)
      .unwrapOr(undefined);
  const baseProcedures = {
    createResource: standardAuthedProcedure
      .input(createResourceInputSchema)
      .mutation<Resource>(async ({ ctx, input }) =>
        requireMutation(
          (
            await ctx.db
              .insert(resources)
              .values({ ...input, type, userId: ctx.getSessionPayload.user.id })
              .returning()
          )[0],
          Operation.Create,
          DatabaseEntityType.Resource,
          ctx.getSessionPayload.user.id,
        ),
      ),
    deleteResource: getOwnerProcedure(type, resourceIdInputSchema, "id").mutation<Resource>(
      async ({ ctx, input: { id } }) => {
        const deletedResource = requireMutation(
          (await ctx.db.delete(resources).where(eq(resources.id, id)).returning())[0],
          Operation.Delete,
          DatabaseEntityType.Resource,
          id,
        );

        const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
        await deleteDirectory(containerClient, id, true);
        return deletedResource;
      },
    ),
    readResourceContent: getOwnerProcedure(type, resourceIdInputSchema, "id").query(async ({ ctx, input: { id } }) => {
      const content = await readContent(id);
      if (content === undefined || !transformReadContent) return content;
      return transformReadContent(ctx, ctx.resource, content);
    }),
    readResources: standardAuthedProcedure
      .input(readResourcesInputSchema)
      .query(async ({ ctx, input: { limit, offset, sortBy } }) => {
        const resultResources = await ctx.db.query.resources.findMany({
          limit: limit + 1,
          offset,
          orderBy: (resources, { desc }) =>
            sortBy.length > 0 ? parseSortByToSql(resources, sortBy) : desc(resources.updatedAt),
          where: {
            type: {
              eq: type,
            },
            userId: {
              eq: ctx.getSessionPayload.user.id,
            },
          },
        });
        return getOffsetPaginationData(resultResources, limit);
      }),
    saveResourceContent: getOwnerProcedure(type, saveResourceContentInputSchema, "id").mutation<Resource>(
      async ({ ctx, input: { content, contentVersion, id } }) => {
        // The version check is part of the UPDATE so concurrent saves cannot both pass and silently lose one write
        const updatedResource = (
          await ctx.db
            .update(resources)
            .set({ contentVersion: contentVersion + 1 })
            .where(and(eq(resources.id, id), eq(resources.contentVersion, contentVersion)))
            .returning()
        )[0];
        if (!updatedResource)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: new InvalidOperationError(
              Operation.Update,
              DatabaseEntityType.Resource,
              "cannot save resource content with old content version",
            ).message,
          });

        await useUpload(AzureContainer.ResourceAssets, getContentBlobName(id), JSON.stringify(content));
        return updatedResource;
      },
    ),
    updateResource: getOwnerProcedure(type, updateResourceInputSchema, "id").mutation<Resource>(
      async ({ ctx, input: { id, ...rest } }) =>
        requireMutation(
          (await ctx.db.update(resources).set(rest).where(eq(resources.id, id)).returning())[0],
          Operation.Update,
          DatabaseEntityType.Resource,
          id,
        ),
    ),
  };
  const publishProcedures = {
    publishResource: getOwnerProcedure(type, resourceIdInputSchema, "id").mutation<Resource>(
      async ({ ctx, input: { id } }) => {
        const content = await readContent(id);
        if (content === undefined)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: new InvalidOperationError(
              Operation.Update,
              DatabaseEntityType.Resource,
              "cannot publish resource without content",
            ).message,
          });

        // The increment is done in SQL so concurrent publishes each claim a distinct publish blob
        const updatedResource = requireMutation(
          (
            await ctx.db
              .update(resources)
              .set({ publishedAt: new Date(), publishVersion: sql`${resources.publishVersion} + 1` })
              .where(eq(resources.id, id))
              .returning()
          )[0],
          Operation.Update,
          DatabaseEntityType.Resource,
          id,
        );

        const publishedContent = transformPublishedContent
          ? await transformPublishedContent(ctx, updatedResource, content)
          : content;
        await useUpload(
          AzureContainer.ResourceAssets,
          getPublishedContentBlobName(id, updatedResource.publishVersion),
          JSON.stringify(publishedContent),
        );
        return updatedResource;
      },
    ),
    readPublishedResourceContent: standardRateLimitedProcedure
      .input(selectResourceSchema.shape.id)
      .query(async ({ ctx, input }) => {
        const resource = await requireEntity(
          ctx.db.query.resources.findFirst({ where: { id: { eq: input }, type: { eq: type } } }),
          DatabaseEntityType.Resource,
          input,
        );
        if (!resource.publishedAt) throw new TRPCError({ code: "NOT_FOUND" });

        const { readableStreamBody } = await useDownload(
          AzureContainer.ResourceAssets,
          getPublishedContentBlobName(input, resource.publishVersion),
        );
        if (!readableStreamBody) throw new TRPCError({ code: "NOT_FOUND" });
        const content = contentSchema.parse(jsonDateParse(await streamToText(readableStreamBody)));
        return { content, name: resource.name };
      }),
    unpublishResource: getOwnerProcedure(type, resourceIdInputSchema, "id").mutation<Resource>(
      async ({ ctx, input: { id } }) => {
        const updatedResource = requireMutation(
          (await ctx.db.update(resources).set({ publishedAt: null }).where(eq(resources.id, id)).returning())[0],
          Operation.Update,
          DatabaseEntityType.Resource,
          id,
        );

        const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
        await deleteDirectory(containerClient, `${id}/published`, true);
        return updatedResource;
      },
    ),
  };
  return {
    ...baseProcedures,
    ...(getIsPublishable(type) ? publishProcedures : {}),
  } as typeof baseProcedures & (TType extends PublishableResourceType ? typeof publishProcedures : unknown);
};
