import type { NumberColumn } from "#shared/models/resource/sheet/column/NumberColumn";
import type { AColumnForm } from "@/models/resource/sheet/column/AColumnForm";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { numberColumnSchema } from "#shared/models/resource/sheet/column/NumberColumn";
import { createAColumnFormSchema } from "@/models/resource/sheet/column/AColumnForm";
import { z } from "zod";

export interface NumberColumnForm
  extends AColumnForm<ColumnType.Number>, Pick<NumberColumn, "footerStatisticsKey" | "format"> {}

export const numberColumnFormSchema = z
  .object({
    ...createAColumnFormSchema(z.literal(ColumnType.Number)).shape,
    footerStatisticsKey: numberColumnSchema.shape.footerStatisticsKey.meta({ title: "Footer Statistics" }),
    format: numberColumnSchema.shape.format,
  })
  .meta({ title: ColumnType.Number }) satisfies z.ZodType<NumberColumnForm>;
