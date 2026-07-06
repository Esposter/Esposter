import type { DatasetProvider } from "@@/server/models/dataset/DatasetProvider";

import { TableEditorType } from "#shared/models/tableEditor/data/TableEditorType";
import { tableEditorConfigurationSchema } from "#shared/models/tableEditor/data/TableEditorConfiguration";
import { dataSourceToDataset } from "#shared/services/tableEditor/dataSourceToDataset";
import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { getContentBlobName } from "@@/server/services/document/getContentBlobName";
import { AzureContainer, DocumentType } from "@esposter/db-schema";
import { streamToText, jsonDateParse } from "@esposter/shared";
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
  return dataSourceToDataset(item.dataSource);
};
