import type { ATableEditorItemEntity } from "#shared/models/tableEditor/data/ATableEditorItemEntity";
import type { SourceColumnId } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";

import { aTableEditorItemEntitySchema } from "#shared/models/tableEditor/data/ATableEditorItemEntity";
import { createSourceColumnIdSchema } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";
import { z } from "zod";

export interface MathVariable extends Pick<ATableEditorItemEntity, "name">, SourceColumnId {}

export const mathVariableSchema = z.object({
  ...aTableEditorItemEntitySchema.pick({ name: true }).shape,
  ...createSourceColumnIdSchema("context.numberColumnItems").shape,
}) satisfies z.ZodType<MathVariable>;
