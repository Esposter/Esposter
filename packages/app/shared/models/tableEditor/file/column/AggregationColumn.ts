import type { ToData } from "@esposter/shared";

import { AColumn, createAColumnSchema } from "#shared/models/tableEditor/file/column/AColumn";
import {
  AggregationTransformationType,
  aggregationTransformationTypeSchema,
} from "#shared/models/tableEditor/file/column/AggregationTransformationType";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { NumberFormat, numberFormatSchema } from "#shared/models/tableEditor/file/column/NumberFormat";
import { z } from "zod";

export class AggregationColumn extends AColumn<ColumnType.Aggregation> {
  aggregationType: AggregationTransformationType = AggregationTransformationType.RunningSum;
  format?: NumberFormat;
  sourceColumnId = "";
  override readonly type = ColumnType.Aggregation;

  constructor(init?: Partial<AggregationColumn>) {
    super();
    Object.assign(this, init);
  }
}

export const aggregationColumnSchema = z.object({
  ...createAColumnSchema(z.literal(ColumnType.Aggregation)).shape,
  aggregationType: aggregationTransformationTypeSchema.meta({ title: "Aggregation" }),
  format: numberFormatSchema.optional(),
  sourceColumnId: z.string().meta({ comp: "select", getItems: "context.numberSourceColumnItems", title: "Column" }),
}) satisfies z.ZodType<ToData<AggregationColumn>>;
