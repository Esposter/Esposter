import type { BooleanColumn } from "#shared/models/resource/sheet/column/BooleanColumn";
import type { AColumnForm } from "@/models/resource/sheet/column/AColumnForm";

import { booleanColumnSchema } from "#shared/models/resource/sheet/column/BooleanColumn";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { createAColumnFormSchema } from "@/models/resource/sheet/column/AColumnForm";
import { z } from "zod";

export interface BooleanColumnForm extends AColumnForm<ColumnType.Boolean>, Pick<BooleanColumn, "format"> {}

export const booleanColumnFormSchema = z
  .object({
    ...createAColumnFormSchema(z.literal(ColumnType.Boolean)).shape,
    format: booleanColumnSchema.shape.format,
  })
  .meta({ title: ColumnType.Boolean }) satisfies z.ZodType<BooleanColumnForm>;
