import type { DateColumn } from "#shared/models/resource/sheet/column/DateColumn";
import type { AColumnForm } from "@/models/resource/sheet/column/AColumnForm";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { dateColumnSchema } from "#shared/models/resource/sheet/column/DateColumn";
import { createAColumnFormSchema } from "@/models/resource/sheet/column/AColumnForm";
import { z } from "zod";

export interface DateColumnForm extends AColumnForm<ColumnType.Date>, Pick<DateColumn, "format"> {}

export const dateColumnFormSchema = z
  .object({
    ...createAColumnFormSchema(z.literal(ColumnType.Date)).shape,
    format: dateColumnSchema.shape.format,
  })
  .meta({ title: ColumnType.Date }) satisfies z.ZodType<DateColumnForm>;
