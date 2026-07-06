import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { selectDocumentSchema } from "@esposter/db-schema";

const readDocumentsInputSchema = createOffsetPaginationParamsSchema(selectDocumentSchema.keyof()).prefault({});

export const documentRouter = router({
  readDocuments: standardAuthedProcedure
    .input(readDocumentsInputSchema)
    .query(async ({ ctx, input: { limit, offset, sortBy } }) => {
      const resultDocuments = await ctx.db.query.documents.findMany({
        limit: limit + 1,
        offset,
        orderBy: (documents, { desc }) =>
          sortBy.length > 0 ? parseSortByToSql(documents, sortBy) : desc(documents.updatedAt),
        where: {
          userId: {
            eq: ctx.getSessionPayload.user.id,
          },
        },
      });
      return getOffsetPaginationData(resultDocuments, limit);
    }),
});
