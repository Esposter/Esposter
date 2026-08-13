import type { AColumnForm } from "@/models/resource/sheet/column/AColumnForm";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { createAColumnFormSchema } from "@/models/resource/sheet/column/AColumnForm";
import { z } from "zod";

export interface StringColumnForm extends AColumnForm<ColumnType.String> {}

export const stringColumnFormSchema = createAColumnFormSchema(z.literal(ColumnType.String)).meta({
  title: ColumnType.String,
}) satisfies z.ZodType<StringColumnForm>;
