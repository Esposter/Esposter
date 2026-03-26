import type { AColumnForm } from "#shared/models/tableEditor/file/column/AColumnForm";

import { createAColumnFormSchema } from "#shared/models/tableEditor/file/column/AColumnForm";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { z } from "zod";

export interface BooleanColumnForm extends AColumnForm<ColumnType.Boolean> {}

export const booleanColumnFormSchema = createAColumnFormSchema(z.literal(ColumnType.Boolean).readonly()).meta({
  title: ColumnType.Boolean,
}) satisfies z.ZodType<BooleanColumnForm>;
