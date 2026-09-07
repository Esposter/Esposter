import type { NumberColumn } from "#shared/models/resource/sheet/column/NumberColumn";
import type { BaseColumnForm } from "@/models/resource/sheet/column/BaseColumnForm";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { numberColumnSchema } from "#shared/models/resource/sheet/column/NumberColumn";
import { createBaseColumnFormSchema } from "@/models/resource/sheet/column/BaseColumnForm";
import { z } from "zod";

export interface NumberColumnForm
  extends BaseColumnForm<ColumnType.Number>, Pick<NumberColumn, "footerStatisticsKey" | "format"> {}

export const numberColumnFormSchema = z
  .object({
    ...createBaseColumnFormSchema(z.literal(ColumnType.Number)).shape,
    footerStatisticsKey: numberColumnSchema.shape.footerStatisticsKey.meta({ title: "Footer Statistics" }),
    format: numberColumnSchema.shape.format,
  })
  .meta({ title: ColumnType.Number }) satisfies z.ZodType<NumberColumnForm>;
