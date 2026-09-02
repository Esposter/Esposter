import type { ComputedColumn } from "#shared/models/resource/sheet/column/ComputedColumn";
import type { BaseColumnForm } from "@/models/resource/sheet/column/BaseColumnForm";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { createBaseColumnFormSchema } from "@/models/resource/sheet/column/BaseColumnForm";
import { columnTransformationFormSchema } from "@/models/resource/sheet/column/transformation/ColumnTransformationForm";
import { z } from "zod";

export interface ComputedColumnForm
  extends BaseColumnForm<ColumnType.Computed>, Pick<ComputedColumn, "transformation"> {}

export const computedColumnFormSchema = z
  .object({
    ...createBaseColumnFormSchema(z.literal(ColumnType.Computed)).shape,
    transformation: columnTransformationFormSchema,
  })
  .meta({ title: ColumnType.Computed }) satisfies z.ZodType<ComputedColumnForm>;
