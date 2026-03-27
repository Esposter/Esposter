import type { AColumnForm } from "#shared/models/tableEditor/file/column/AColumnForm";
import type { NumberFormat } from "#shared/models/tableEditor/file/column/NumberFormat";

import { createAColumnFormSchema } from "#shared/models/tableEditor/file/column/AColumnForm";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { numberColumnSchema } from "#shared/models/tableEditor/file/column/NumberColumn";
import { z } from "zod";

export interface NumberColumnForm extends AColumnForm<ColumnType.Number> {
  format?: NumberFormat;
}

export const numberColumnFormSchema = z
  .object({
    ...createAColumnFormSchema(z.literal(ColumnType.Number).readonly()).shape,
    format: numberColumnSchema.shape.format.meta({ title: "Format" }),
  })
  .meta({ title: ColumnType.Number }) satisfies z.ZodType<NumberColumnForm>;
