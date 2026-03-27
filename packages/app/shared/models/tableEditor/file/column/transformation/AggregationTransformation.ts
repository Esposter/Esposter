import type { ItemEntityType } from "@esposter/shared";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import {
  AggregationTransformationType,
  aggregationTransformationTypeSchema,
} from "#shared/models/tableEditor/file/column/transformation/AggregationTransformationType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import type { SourceColumnId } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";

import { sourceColumnIdSchema } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface AggregationTransformation
  extends ItemEntityType<ColumnTransformationType.Aggregation>, SourceColumnId {
  aggregationType: AggregationTransformationType;
}

export const aggregationTransformationSchema = z
  .object({
    ...sourceColumnIdSchema.shape,
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.Aggregation).readonly()).shape,
    aggregationType: aggregationTransformationTypeSchema.meta({ title: "Aggregation" }),
    sourceColumnId: sourceColumnIdSchema.shape.sourceColumnId.meta({
      getItems: "context.numberSourceColumnItems",
    }),
  })
  .meta({
    applicableColumnTypes: [ColumnType.Number],
    title: ColumnTransformationType.Aggregation,
  }) satisfies z.ZodType<AggregationTransformation>;
