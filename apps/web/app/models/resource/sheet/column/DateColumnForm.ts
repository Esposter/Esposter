import type { DateColumn } from "#shared/models/resource/sheet/column/DateColumn";
import type { BaseColumnForm } from "@/models/resource/sheet/column/BaseColumnForm";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { dateColumnSchema } from "#shared/models/resource/sheet/column/DateColumn";
import { createBaseColumnFormSchema } from "@/models/resource/sheet/column/BaseColumnForm";
import { z } from "zod";

export interface DateColumnForm extends BaseColumnForm<ColumnType.Date>, Pick<DateColumn, "format"> {}

export const dateColumnFormSchema = z
  .object({
    ...createBaseColumnFormSchema(z.literal(ColumnType.Date)).shape,
    format: dateColumnSchema.shape.format,
  })
  .meta({ title: ColumnType.Date }) satisfies z.ZodType<DateColumnForm>;
