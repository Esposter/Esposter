import type { AColumnForm } from "#shared/models/tableEditor/file/column/AColumnForm";

import { createAColumnFormSchema } from "#shared/models/tableEditor/file/column/AColumnForm";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { z } from "zod";

export interface StringColumnForm extends AColumnForm<ColumnType.String> {}

export const stringColumnFormSchema = createAColumnFormSchema(z.literal(ColumnType.String).readonly()).meta({
  title: ColumnType.String,
}) satisfies z.ZodType<StringColumnForm>;
