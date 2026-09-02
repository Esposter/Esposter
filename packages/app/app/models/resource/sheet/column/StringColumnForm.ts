import type { BaseColumnForm } from "@/models/resource/sheet/column/BaseColumnForm";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { createBaseColumnFormSchema } from "@/models/resource/sheet/column/BaseColumnForm";
import { z } from "zod";

export interface StringColumnForm extends BaseColumnForm<ColumnType.String> {}

export const stringColumnFormSchema = createBaseColumnFormSchema(z.literal(ColumnType.String)).meta({
  title: ColumnType.String,
}) satisfies z.ZodType<StringColumnForm>;
