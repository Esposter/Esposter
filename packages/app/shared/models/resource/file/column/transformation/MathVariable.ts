import type { ANamedItemEntity } from "#shared/models/entity/ANamedItemEntity";
import type { SourceColumnId } from "#shared/models/resource/file/column/transformation/SourceColumnId";

import { aNamedItemEntitySchema } from "#shared/models/entity/ANamedItemEntity";
import { createSourceColumnIdSchema } from "#shared/models/resource/file/column/transformation/SourceColumnId";
import { ColumnFormVjsfContextPropertyNames } from "@/models/resource/file/column/ColumnFormVjsfContext";
import { z } from "zod";

export interface MathVariable extends Pick<ANamedItemEntity, "name">, SourceColumnId {}

export const mathVariableSchema = z.object({
  ...aNamedItemEntitySchema.pick({ name: true }).shape,
  ...createSourceColumnIdSchema(ColumnFormVjsfContextPropertyNames["context.numberColumnItems"]).shape,
}) satisfies z.ZodType<MathVariable>;
