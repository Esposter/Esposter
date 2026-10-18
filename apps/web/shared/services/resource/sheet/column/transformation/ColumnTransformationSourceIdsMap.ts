import type { ColumnTransformation } from "#shared/models/resource/sheet/column/transformation/ColumnTransformation";

import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";

// The ids a transformation reads, so the sheet can find the cycles between its computed columns before any is bound
export const ColumnTransformationSourceIdsMap = {
  [ColumnTransformationType.Aggregation]: ({ sourceColumnId }) => [sourceColumnId],
  [ColumnTransformationType.ConvertTo]: ({ sourceColumnId }) => [sourceColumnId],
  [ColumnTransformationType.DatePart]: ({ sourceColumnId }) => [sourceColumnId],
  [ColumnTransformationType.Math]: ({ variables }) => variables.map(({ sourceColumnId }) => sourceColumnId),
  [ColumnTransformationType.RegexMatch]: ({ sourceColumnId }) => [sourceColumnId],
  [ColumnTransformationType.String]: ({ sourceColumnId }) => [sourceColumnId],
  [ColumnTransformationType.StringPattern]: ({ sourceColumnIds }) => sourceColumnIds,
  [ColumnTransformationType.StringSplit]: ({ sourceColumnId }) => [sourceColumnId],
} as const satisfies {
  [K in ColumnTransformationType]: (transformation: Extract<ColumnTransformation, { type: K }>) => string[];
};
