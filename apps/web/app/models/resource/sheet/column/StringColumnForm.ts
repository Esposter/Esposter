import type { BaseColumnForm } from "#src/models/resource/sheet/column/BaseColumnForm";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { createBaseColumnFormSchema } from "#src/services/resource/sheet/column/createBaseColumnFormSchema";
import { z } from "zod";

export interface StringColumnForm extends BaseColumnForm<typeof ColumnType.String> {}

export const stringColumnFormSchema = createBaseColumnFormSchema(z.literal(ColumnType.String)).meta({
  title: ColumnType.String,
}) satisfies z.ZodType<StringColumnForm>;
