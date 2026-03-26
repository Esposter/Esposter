import type { AColumnForm } from "#shared/models/tableEditor/file/column/AColumnForm";

import { createAColumnFormSchema } from "#shared/models/tableEditor/file/column/AColumnForm";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { z } from "zod";

export interface NumberColumnForm extends AColumnForm<ColumnType.Number> {}

export const numberColumnFormSchema = createAColumnFormSchema(z.literal(ColumnType.Number).readonly()).meta({
  title: ColumnType.Number,
}) satisfies z.ZodType<NumberColumnForm>;
