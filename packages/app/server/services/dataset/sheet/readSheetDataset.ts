import type { DatasetProvider } from "@@/server/models/dataset/DatasetProvider";

import { sheetResourceSchema } from "#shared/models/resource/sheet/SheetResource";
import { dataSourceToDataset } from "#shared/services/resource/sheet/dataSourceToDataset";
import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { getContentBlobName } from "@@/server/services/resource/getContentBlobName";
import { requireActiveOwnedResource } from "@@/server/services/resource/requireActiveOwnedResource";
import { AZURE_MAX_PAGE_SIZE, AzureContainer, ResourceType } from "@esposter/db-schema";
import { streamToText } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const readSheetDataset: DatasetProvider = async (ctx, reference) => {
  await requireActiveOwnedResource(ctx, reference.id, ResourceType.Sheet);

  const { readableStreamBody } = await useDownload(AzureContainer.ResourceAssets, getContentBlobName(reference.id));
  if (!readableStreamBody) throw new TRPCError({ code: "NOT_FOUND" });

  // Plain JSON.parse: sheetResourceSchema coerces its genuine date fields, so an ISO-datetime cell
  // Value is not mis-revived into a Date that columnValueSchema would then reject.
  const { data } = sheetResourceSchema.parse(JSON.parse(await streamToText(readableStreamBody)));
  // Capped like readSurveyResponsesDataset so file-backed datasets cannot return unbounded payloads.
  // The whole blob is already in hand, so the uncapped total costs nothing to report
  return {
    ...dataSourceToDataset({ ...data, rows: data.rows.slice(0, AZURE_MAX_PAGE_SIZE) }),
    totalRows: data.rows.length,
  };
};
