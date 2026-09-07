import type { ColumnForm } from "@/models/resource/sheet/column/ColumnForm";
import type { z } from "zod";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { booleanColumnFormSchema } from "@/models/resource/sheet/column/BooleanColumnForm";
import { computedColumnFormSchema } from "@/models/resource/sheet/column/ComputedColumnForm";
import { dateColumnFormSchema } from "@/models/resource/sheet/column/DateColumnForm";
import { numberColumnFormSchema } from "@/models/resource/sheet/column/NumberColumnForm";
import { stringColumnFormSchema } from "@/models/resource/sheet/column/StringColumnForm";

export const ColumnTypeFormSchemaMap = {
  [ColumnType.Boolean]: booleanColumnFormSchema,
  [ColumnType.Computed]: computedColumnFormSchema,
  [ColumnType.Date]: dateColumnFormSchema,
  [ColumnType.Number]: numberColumnFormSchema,
  [ColumnType.String]: stringColumnFormSchema,
} as const satisfies Record<ColumnType, z.ZodType<ColumnForm>>;
