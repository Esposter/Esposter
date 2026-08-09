import type { SourceColumnId } from "#shared/models/resource/sheet/column/transformation/SourceColumnId";
import type { ItemEntityType } from "@esposter/shared";

import {
  AggregationTransformationType,
  aggregationTransformationTypeSchema,
} from "#shared/models/resource/sheet/column/transformation/AggregationTransformationType";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { sourceColumnIdSchema } from "#shared/models/resource/sheet/column/transformation/SourceColumnId";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface AggregationTransformation
  extends ItemEntityType<ColumnTransformationType.Aggregation>, SourceColumnId {
  aggregationTransformationType: AggregationTransformationType;
}

export const aggregationTransformationSchema = z.object({
  ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.Aggregation).readonly()).shape,
  ...sourceColumnIdSchema.shape,
  aggregationTransformationType: aggregationTransformationTypeSchema,
}) satisfies z.ZodType<AggregationTransformation>;
