import type { DatasetProvider } from "@@/server/models/dataset/DatasetProvider";

import { sheetResourceSchema } from "#shared/models/resource/sheet/SheetResource";
import { dataSourceToDataset } from "#shared/services/resource/sheet/dataSourceToDataset";
import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { getContentBlobName } from "@@/server/services/resource/getContentBlobName";
import { AZURE_MAX_PAGE_SIZE, AzureContainer, ResourceType } from "@esposter/db-schema";
import { jsonDateParse, streamToText } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const readSheetDataset: DatasetProvider = async (ctx, reference) => {
  const resource = await ctx.db.query.resources.findFirst({
    where: {
      id: {
        eq: reference.id,
      },
      type: {
        eq: ResourceType.Sheet,
      },
      userId: {
        eq: ctx.getSessionPayload.user.id,
      },
    },
  });
  if (!resource) throw new TRPCError({ code: "UNAUTHORIZED" });

  const { readableStreamBody } = await useDownload(AzureContainer.ResourceAssets, getContentBlobName(reference.id));
  if (!readableStreamBody) throw new TRPCError({ code: "NOT_FOUND" });

  const { data } = sheetResourceSchema.parse(jsonDateParse(await streamToText(readableStreamBody)));
  // Capped like readSurveyResponsesDataset so file-backed datasets cannot return unbounded payloads
  return dataSourceToDataset({ ...data, rows: data.rows.slice(0, AZURE_MAX_PAGE_SIZE) });
};
