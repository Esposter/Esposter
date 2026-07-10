import type { AColumnForm } from "#shared/models/resource/file/column/AColumnForm";

import { createAColumnFormSchema } from "#shared/models/resource/file/column/AColumnForm";
import { ColumnType } from "#shared/models/resource/file/column/ColumnType";
import { dateColumnSchema } from "#shared/models/resource/file/column/DateColumn";
import { DateFormat } from "#shared/models/resource/file/column/DateFormat";
import { z } from "zod";

export interface DateColumnForm extends AColumnForm<ColumnType.Date> {
  format: DateFormat;
}

export const dateColumnFormSchema = z
  .object({
    ...createAColumnFormSchema(z.literal(ColumnType.Date).readonly()).shape,
    format: dateColumnSchema.shape.format,
  })
  .meta({ title: ColumnType.Date }) satisfies z.ZodType<DateColumnForm>;
