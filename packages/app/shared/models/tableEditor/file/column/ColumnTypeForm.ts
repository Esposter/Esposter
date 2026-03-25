import type { ColumnForm } from "#shared/models/tableEditor/file/column/ColumnForm";

import { columnFormSchema } from "#shared/models/tableEditor/file/column/ColumnForm";
import { computedColumnFormSchema } from "#shared/models/tableEditor/file/column/ComputedColumn";
import { dateColumnFormSchema } from "#shared/models/tableEditor/file/column/DateColumn";
import { z } from "zod";

export const columnTypeFormSchema = z.discriminatedUnion("type", [
  columnFormSchema,
  dateColumnFormSchema,
  computedColumnFormSchema,
]) satisfies z.ZodType<ColumnForm>;
