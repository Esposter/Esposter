import type { BooleanColumnForm } from "#shared/models/tableEditor/file/column/BooleanColumnForm";
import type { ComputedColumnForm } from "#shared/models/tableEditor/file/column/ComputedColumnForm";
import type { DateColumnForm } from "#shared/models/tableEditor/file/column/DateColumnForm";
import type { NumberColumnForm } from "#shared/models/tableEditor/file/column/NumberColumnForm";
import type { StringColumnForm } from "#shared/models/tableEditor/file/column/StringColumnForm";

import { booleanColumnFormSchema } from "#shared/models/tableEditor/file/column/BooleanColumnForm";
import { computedColumnFormSchema } from "#shared/models/tableEditor/file/column/ComputedColumnForm";
import { dateColumnFormSchema } from "#shared/models/tableEditor/file/column/DateColumnForm";
import { numberColumnFormSchema } from "#shared/models/tableEditor/file/column/NumberColumnForm";
import { stringColumnFormSchema } from "#shared/models/tableEditor/file/column/StringColumnForm";
import { z } from "zod";

export type ColumnForm = BooleanColumnForm | ComputedColumnForm | DateColumnForm | NumberColumnForm | StringColumnForm;

export const columnFormSchema = z.discriminatedUnion("type", [
  booleanColumnFormSchema,
  computedColumnFormSchema,
  dateColumnFormSchema,
  numberColumnFormSchema,
  stringColumnFormSchema,
]) satisfies z.ZodType<ColumnForm>;
