import type { DatasetProvider } from "@@/server/models/dataset/DatasetProvider";

import { tableEditorConfigurationSchema } from "#shared/models/tableEditor/data/TableEditorConfiguration";
import { TableEditorType } from "#shared/models/tableEditor/data/TableEditorType";
import { dataSourceToDataset } from "#shared/services/tableEditor/dataSourceToDataset";
import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { MAX_DATASET_ROWS } from "@@/server/services/dataset/constants";
import { getContentBlobName } from "@@/server/services/document/getContentBlobName";
import { AzureContainer, DocumentType } from "@esposter/db-schema";
import { jsonDateParse, streamToText } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const readTableDocumentDataset: DatasetProvider = async (ctx, reference) => {
  const document = await ctx.db.query.documents.findFirst({
    where: {
      id: {
        eq: reference.id,
      },
      type: {
        eq: DocumentType.Table,
      },
      userId: {
        eq: ctx.getSessionPayload.user.id,
      },
    },
  });
  if (!document) throw new TRPCError({ code: "UNAUTHORIZED" });

  const { readableStreamBody } = await useDownload(AzureContainer.TableEditorAssets, getContentBlobName(reference.id));
  if (!readableStreamBody) throw new TRPCError({ code: "NOT_FOUND" });

  const configuration = tableEditorConfigurationSchema.parse(jsonDateParse(await streamToText(readableStreamBody)));
  const items = configuration[TableEditorType.File].items;
  const item = reference.itemId ? items.find(({ id }) => id === reference.itemId) : items[0];
  if (!item?.dataSource) throw new TRPCError({ code: "NOT_FOUND" });
  // Capped like readSurveyResponsesDataset so table-backed datasets cannot return unbounded payloads
  return dataSourceToDataset({ ...item.dataSource, rows: item.dataSource.rows.slice(0, MAX_DATASET_ROWS) });
};
