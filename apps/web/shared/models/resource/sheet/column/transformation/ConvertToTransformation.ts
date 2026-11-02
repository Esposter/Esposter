import type { DatasetColumnType } from "#shared/models/dataset/DatasetColumnType";
import type { SourceColumnId } from "#shared/models/resource/sheet/column/transformation/SourceColumnId";
import type { ItemEntityType } from "@esposter/shared";

import { datasetColumnTypeSchema } from "#shared/models/dataset/DatasetColumnType";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { sourceColumnIdSchema } from "#shared/models/resource/sheet/column/transformation/SourceColumnId";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface ConvertToTransformation extends ItemEntityType<ColumnTransformationType.ConvertTo>, SourceColumnId {
  // A computed column is served as the type it yields, so a target is any type a dataset column can hold
  targetType: DatasetColumnType;
}

export const convertToTransformationSchema = z.object({
  ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.ConvertTo).readonly()).shape,
  ...sourceColumnIdSchema.shape,
  targetType: datasetColumnTypeSchema,
}) satisfies z.ZodType<ConvertToTransformation>;
