import type { SourceColumnId } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";

import { sourceColumnIdSchema } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";
import { z } from "zod";

export interface MathOperationVariable extends SourceColumnId {
  name: string;
}

export const mathOperationVariableSchema = z.object({
  name: z.string().meta({ title: "Name" }),
  sourceColumnId: sourceColumnIdSchema.shape.sourceColumnId.meta({
    getItems: "context.numberColumnItems",
  }),
});
