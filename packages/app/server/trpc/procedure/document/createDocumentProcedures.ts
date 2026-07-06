import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { AzureContainer, Document, DocumentType } from "@esposter/db-schema";

import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { getContentBlobName } from "@@/server/services/document/getContentBlobName";
import { getPublishedContentBlobName } from "@@/server/services/document/getPublishedContentBlobName";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { getOwnerProcedure } from "@@/server/trpc/procedure/document/getOwnerProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";
import { deleteDirectory } from "@esposter/db";
import { DatabaseEntityType, documents, selectDocumentSchema } from "@esposter/db-schema";
import { getResultAsync, InvalidOperationError, jsonDateParse, Operation, streamToText } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

const readDocumentsInputSchema = createOffsetPaginationParamsSchema(selectDocumentSchema.keyof()).prefault({});

const createDocumentInputSchema = selectDocumentSchema.pick({ name: true });

const updateDocumentInputSchema = selectDocumentSchema.pick({ id: true, name: true });

const documentIdInputSchema = selectDocumentSchema.pick({ id: true });

export const createDocumentProcedures = <TSchema extends z.ZodType>(
  type: DocumentType,
  contentSchema: TSchema,
  container: AzureContainer,
  transformPublishedContent?: (ctx: AuthedContext, content: z.infer<TSchema>) => Promise<z.infer<TSchema>>,
) => {
  // Annotated so the generic content schema resolves to a concrete type for destructuring.
  // Both the output and input sides are declared — leaving the input side defaulted to unknown
  // would erase the procedure's input type for consumers like achievement condition paths.
  const saveDocumentContentInputSchema = z.object({
    content: contentSchema,
    contentVersion: selectDocumentSchema.shape.contentVersion,
    id: selectDocumentSchema.shape.id,
  }) as unknown as z.ZodType<
    { content: z.infer<TSchema>; contentVersion: Document["contentVersion"]; id: Document["id"] },
    { content: z.input<TSchema>; contentVersion: Document["contentVersion"]; id: Document["id"] }
  >;
  const readContent = (id: Document["id"]): Promise<undefined | z.infer<TSchema>> =>
    getResultAsync(async () => {
      const { readableStreamBody } = await useDownload(container, getContentBlobName(id));
      if (!readableStreamBody) return undefined;
      return contentSchema.parse(jsonDateParse(await streamToText(readableStreamBody)));
    })
      .orTee(console.error)
      .unwrapOr(undefined);
  return {
    createDocument: standardAuthedProcedure
      .input(createDocumentInputSchema)
      .mutation<Document>(async ({ ctx, input }) =>
        requireMutation(
          (
            await ctx.db
              .insert(documents)
              .values({ ...input, type, userId: ctx.getSessionPayload.user.id })
              .returning()
          )[0],
          Operation.Create,
          DatabaseEntityType.Document,
          ctx.getSessionPayload.user.id,
        ),
      ),
    deleteDocument: getOwnerProcedure(type, documentIdInputSchema, "id").mutation<Document>(
      async ({ ctx, input: { id } }) => {
        const deletedDocument = requireMutation(
          (await ctx.db.delete(documents).where(eq(documents.id, id)).returning())[0],
          Operation.Delete,
          DatabaseEntityType.Document,
          id,
        );

        const containerClient = await useContainerClient(container);
        await deleteDirectory(containerClient, id, true);
        return deletedDocument;
      },
    ),
    publishDocument: getOwnerProcedure(type, documentIdInputSchema, "id").mutation<Document>(
      async ({ ctx, input: { id } }) => {
        const content = await readContent(id);
        if (content === undefined)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: new InvalidOperationError(
              Operation.Update,
              DatabaseEntityType.Document,
              "cannot publish document without content",
            ).message,
          });

        // The increment is done in SQL so concurrent publishes each claim a distinct publish blob
        const updatedDocument = requireMutation(
          (
            await ctx.db
              .update(documents)
              .set({ publishedAt: new Date(), publishVersion: sql`${documents.publishVersion} + 1` })
              .where(eq(documents.id, id))
              .returning()
          )[0],
          Operation.Update,
          DatabaseEntityType.Document,
          id,
        );

        const publishedContent = transformPublishedContent ? await transformPublishedContent(ctx, content) : content;
        await useUpload(
          container,
          getPublishedContentBlobName(id, updatedDocument.publishVersion),
          JSON.stringify(publishedContent),
        );
        return updatedDocument;
      },
    ),
    readDocumentContent: getOwnerProcedure(type, documentIdInputSchema, "id").query(({ input: { id } }) =>
      readContent(id),
    ),
    readDocuments: standardAuthedProcedure
      .input(readDocumentsInputSchema)
      .query(async ({ ctx, input: { limit, offset, sortBy } }) => {
        const resultDocuments = await ctx.db.query.documents.findMany({
          limit: limit + 1,
          offset,
          orderBy: (documents, { desc }) =>
            sortBy.length > 0 ? parseSortByToSql(documents, sortBy) : desc(documents.updatedAt),
          where: {
            type: {
              eq: type,
            },
            userId: {
              eq: ctx.getSessionPayload.user.id,
            },
          },
        });
        return getOffsetPaginationData(resultDocuments, limit);
      }),
    readPublishedDocumentContent: standardRateLimitedProcedure
      .input(selectDocumentSchema.shape.id)
      .query(async ({ ctx, input }) => {
        const document = await requireEntity(
          ctx.db.query.documents.findFirst({ where: { id: { eq: input }, type: { eq: type } } }),
          DatabaseEntityType.Document,
          input,
        );
        if (!document.publishedAt) throw new TRPCError({ code: "NOT_FOUND" });

        const { readableStreamBody } = await useDownload(
          container,
          getPublishedContentBlobName(input, document.publishVersion),
        );
        if (!readableStreamBody) throw new TRPCError({ code: "NOT_FOUND" });
        const content = contentSchema.parse(jsonDateParse(await streamToText(readableStreamBody)));
        return { content, name: document.name };
      }),
    saveDocumentContent: getOwnerProcedure(type, saveDocumentContentInputSchema, "id").mutation<Document>(
      async ({ ctx, input: { content, contentVersion, id } }) => {
        // The version check is part of the UPDATE so concurrent saves cannot both pass and silently lose one write
        const updatedDocument = (
          await ctx.db
            .update(documents)
            .set({ contentVersion: contentVersion + 1 })
            .where(and(eq(documents.id, id), eq(documents.contentVersion, contentVersion)))
            .returning()
        )[0];
        if (!updatedDocument)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: new InvalidOperationError(
              Operation.Update,
              DatabaseEntityType.Document,
              "cannot save document content with old content version",
            ).message,
          });

        await useUpload(container, getContentBlobName(id), JSON.stringify(content));
        return updatedDocument;
      },
    ),
    unpublishDocument: getOwnerProcedure(type, documentIdInputSchema, "id").mutation<Document>(
      async ({ ctx, input: { id } }) => {
        const updatedDocument = requireMutation(
          (await ctx.db.update(documents).set({ publishedAt: null }).where(eq(documents.id, id)).returning())[0],
          Operation.Update,
          DatabaseEntityType.Document,
          id,
        );

        const containerClient = await useContainerClient(container);
        await deleteDirectory(containerClient, `${id}/published`, true);
        return updatedDocument;
      },
    ),
    updateDocument: getOwnerProcedure(type, updateDocumentInputSchema, "id").mutation<Document>(
      async ({ ctx, input: { id, ...rest } }) =>
        requireMutation(
          (await ctx.db.update(documents).set(rest).where(eq(documents.id, id)).returning())[0],
          Operation.Update,
          DatabaseEntityType.Document,
          id,
        ),
    ),
  };
};
