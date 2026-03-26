import type { AColumnForm } from "#shared/models/tableEditor/file/column/AColumnForm";

import { createAColumnFormSchema } from "#shared/models/tableEditor/file/column/AColumnForm";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { DateFormat } from "#shared/models/tableEditor/file/column/DateFormat";
import { dateColumnSchema } from "#shared/models/tableEditor/file/column/DateColumn";
import { z } from "zod";

export interface DateColumnForm extends AColumnForm<ColumnType.Date> {
  format: DateFormat;
}

export const dateColumnFormSchema = z
  .object({
    ...createAColumnFormSchema(z.literal(ColumnType.Date).readonly()).shape,
    format: dateColumnSchema.shape.format.meta({ title: "Format" }),
  })
  .meta({ title: ColumnType.Date }) satisfies z.ZodType<DateColumnForm>;
