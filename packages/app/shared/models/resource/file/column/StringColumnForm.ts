import type { AColumnForm } from "#shared/models/resource/file/column/AColumnForm";

import { createAColumnFormSchema } from "#shared/models/resource/file/column/AColumnForm";
import { ColumnType } from "#shared/models/resource/file/column/ColumnType";
import { z } from "zod";

export interface StringColumnForm extends AColumnForm<ColumnType.String> {}

export const stringColumnFormSchema = createAColumnFormSchema(z.literal(ColumnType.String).readonly()).meta({
  title: ColumnType.String,
}) satisfies z.ZodType<StringColumnForm>;
