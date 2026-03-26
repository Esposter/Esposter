import type { AColumnForm } from "#shared/models/tableEditor/file/column/AColumnForm";
import type { DATE_FORMATS } from "#shared/models/tableEditor/file/constants";

import { createAColumnFormSchema } from "#shared/models/tableEditor/file/column/AColumnForm";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { dateColumnSchema } from "#shared/models/tableEditor/file/column/DateColumn";
import { z } from "zod";

export interface DateColumnForm extends AColumnForm<ColumnType.Date> {
  format: (typeof DATE_FORMATS)[number];
}

export const dateColumnFormSchema = z
  .object({
    ...createAColumnFormSchema(z.literal(ColumnType.Date).readonly()).shape,
    format: dateColumnSchema.shape.format.meta({ title: "Format" }),
  })
  .meta({ title: ColumnType.Date }) satisfies z.ZodType<DateColumnForm>;
