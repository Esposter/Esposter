import type { DatasetColumn } from "#shared/models/dataset/DatasetColumn";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { SurveyResponseEntity } from "@esposter/db-schema";

import { toDatasetColumnValue } from "@@/server/services/dataset/surveyResponses/toDatasetColumnValue";

// Keyed off the columns rather than the answers, so a skipped question is a null cell rather than a
// Missing key — every row carries every column
export const toSurveyResponseDatasetRow = (
  columns: DatasetColumn[],
  model: SurveyResponseEntity["model"],
): Record<string, ColumnValue> =>
  Object.fromEntries(columns.map(({ name }) => [name, toDatasetColumnValue(model[name])]));
