import type { AColumnForm } from "#shared/models/tableEditor/file/column/AColumnForm";
import type { AggregationTransformationType } from "#shared/models/tableEditor/file/column/AggregationTransformationType";
import type { NumberFormat } from "#shared/models/tableEditor/file/column/NumberFormat";

import { createAColumnFormSchema } from "#shared/models/tableEditor/file/column/AColumnForm";
import { aggregationColumnSchema } from "#shared/models/tableEditor/file/column/AggregationColumn";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { z } from "zod";

export interface AggregationColumnForm extends AColumnForm<ColumnType.Aggregation> {
  aggregationType: AggregationTransformationType;
  format?: NumberFormat;
  sourceColumnId: string;
}

export const aggregationColumnFormSchema = z
  .object({
    ...createAColumnFormSchema(z.literal(ColumnType.Aggregation).readonly()).shape,
    aggregationType: aggregationColumnSchema.shape.aggregationType,
    format: aggregationColumnSchema.shape.format.meta({ title: "Format" }),
    sourceColumnId: aggregationColumnSchema.shape.sourceColumnId,
  })
  .meta({ title: ColumnType.Aggregation }) satisfies z.ZodType<AggregationColumnForm>;
