import type { DatasetProvider } from "#server/models/dataset/DatasetProvider";

import { readResourceContent } from "#server/services/resource/readResourceContent";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { sheetResourceSchema } from "#shared/models/resource/sheet/SheetResource";
import { dataSourceToDataset } from "#shared/services/resource/sheet/dataSourceToDataset";
import { DatabaseEntityType } from "@esposter/db-schema";
import { MAX_READ_LIMIT } from "@esposter/shared";

export const readSheetDataset: DatasetProvider["read"] = async (_db, { id }) => {
  const content = await readResourceContent(sheetResourceSchema, id);
  if (!content) throw getNotFoundError(DatabaseEntityType.Resource, id);

  const { data } = content;
  // Capped like readSurveyResponsesDataset so file-backed datasets cannot return unbounded payloads.
  // The whole blob is already in hand, so the uncapped total costs nothing to report
  return { ...dataSourceToDataset(data, MAX_READ_LIMIT), totalRows: data.rows.length };
};
