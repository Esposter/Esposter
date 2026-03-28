import type { ATableEditorItemEntity } from "#shared/models/tableEditor/data/ATableEditorItemEntity";
import type { SourceColumnId } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";

import { aTableEditorItemEntitySchema } from "#shared/models/tableEditor/data/ATableEditorItemEntity";
import { sourceColumnIdSchema } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";
import { z } from "zod";

export interface MathVariable extends Pick<ATableEditorItemEntity, "name">, SourceColumnId {}

export const mathVariableSchema = z.object({
  ...aTableEditorItemEntitySchema.pick({ name: true }).shape,
  sourceColumnId: sourceColumnIdSchema.shape.sourceColumnId.meta({
    getItems: "context.numberColumnItems",
  }),
}) satisfies z.ZodType<MathVariable>;
