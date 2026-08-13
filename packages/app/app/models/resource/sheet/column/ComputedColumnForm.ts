import type { ComputedColumn } from "#shared/models/resource/sheet/column/ComputedColumn";
import type { AColumnForm } from "@/models/resource/sheet/column/AColumnForm";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { createAColumnFormSchema } from "@/models/resource/sheet/column/AColumnForm";
import { columnTransformationFormSchema } from "@/models/resource/sheet/column/transformation/ColumnTransformationForm";
import { z } from "zod";

export interface ComputedColumnForm extends AColumnForm<ColumnType.Computed>, Pick<ComputedColumn, "transformation"> {}

export const computedColumnFormSchema = z
  .object({
    ...createAColumnFormSchema(z.literal(ColumnType.Computed)).shape,
    transformation: columnTransformationFormSchema,
  })
  .meta({ title: ColumnType.Computed }) satisfies z.ZodType<ComputedColumnForm>;
