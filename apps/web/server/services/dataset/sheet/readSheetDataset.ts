import type { DatasetProvider } from "@@/server/models/dataset/DatasetProvider";

import { sheetResourceSchema } from "#shared/models/resource/sheet/SheetResource";
import { dataSourceToDataset } from "#shared/services/resource/sheet/dataSourceToDataset";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { getNotFoundError } from "@@/server/trpc/guards/getNotFoundError";
import { AZURE_MAX_PAGE_SIZE } from "@esposter/azure";
import { DatabaseEntityType } from "@esposter/db-schema";

export const readSheetDataset: DatasetProvider["read"] = async ({ id }) => {
  const content = await readResourceContent(sheetResourceSchema, id);
  if (!content) throw getNotFoundError(DatabaseEntityType.Resource, id);

  const { data } = content;
  // Capped like readSurveyResponsesDataset so file-backed datasets cannot return unbounded payloads.
  // The whole blob is already in hand, so the uncapped total costs nothing to report
  return {
    ...dataSourceToDataset({ ...data, rows: data.rows.slice(0, AZURE_MAX_PAGE_SIZE) }),
    totalRows: data.rows.length,
  };
};
