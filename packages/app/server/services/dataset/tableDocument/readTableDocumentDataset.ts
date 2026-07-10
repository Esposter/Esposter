import type { DatasetProvider } from "@@/server/models/dataset/DatasetProvider";

import { tableEditorConfigurationSchema } from "#shared/models/tableEditor/data/TableEditorConfiguration";
import { TableEditorType } from "#shared/models/tableEditor/data/TableEditorType";
import { dataSourceToDataset } from "#shared/services/resource/file/dataSourceToDataset";
import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { getContentBlobName } from "@@/server/services/resource/getContentBlobName";
import { AZURE_MAX_PAGE_SIZE, AzureContainer, ResourceType } from "@esposter/db-schema";
import { jsonDateParse, streamToText } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const readTableDocumentDataset: DatasetProvider = async (ctx, reference) => {
  const resource = await ctx.db.query.resources.findFirst({
    where: {
      id: {
        eq: reference.id,
      },
      type: {
        eq: ResourceType.Table,
      },
      userId: {
        eq: ctx.getSessionPayload.user.id,
      },
    },
  });
  if (!resource) throw new TRPCError({ code: "UNAUTHORIZED" });

  const { readableStreamBody } = await useDownload(AzureContainer.ResourceAssets, getContentBlobName(reference.id));
  if (!readableStreamBody) throw new TRPCError({ code: "NOT_FOUND" });

  const configuration = tableEditorConfigurationSchema.parse(jsonDateParse(await streamToText(readableStreamBody)));
  const items = configuration[TableEditorType.File].items;
  const item = reference.itemId ? items.find(({ id }) => id === reference.itemId) : items[0];
  if (!item?.dataSource) throw new TRPCError({ code: "NOT_FOUND" });
  // Capped like readSurveyResponsesDataset so table-backed datasets cannot return unbounded payloads
  return dataSourceToDataset({ ...item.dataSource, rows: item.dataSource.rows.slice(0, AZURE_MAX_PAGE_SIZE) });
};
