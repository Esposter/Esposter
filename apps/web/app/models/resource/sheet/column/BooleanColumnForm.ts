import type { BooleanColumn } from "#shared/models/resource/sheet/column/BooleanColumn";
import type { BaseColumnForm } from "@/models/resource/sheet/column/BaseColumnForm";

import { booleanColumnSchema } from "#shared/models/resource/sheet/column/BooleanColumn";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { createBaseColumnFormSchema } from "@/models/resource/sheet/column/BaseColumnForm";
import { z } from "zod";

export interface BooleanColumnForm extends BaseColumnForm<ColumnType.Boolean>, Pick<BooleanColumn, "format"> {}

export const booleanColumnFormSchema = z
  .object({
    ...createBaseColumnFormSchema(z.literal(ColumnType.Boolean)).shape,
    format: booleanColumnSchema.shape.format,
  })
  .meta({ title: ColumnType.Boolean }) satisfies z.ZodType<BooleanColumnForm>;
