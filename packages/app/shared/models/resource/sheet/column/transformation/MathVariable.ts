import type { ANamedItemEntity } from "#shared/models/entity/ANamedItemEntity";
import type { SourceColumnId } from "#shared/models/resource/sheet/column/transformation/SourceColumnId";

import { aNamedItemEntitySchema } from "#shared/models/entity/ANamedItemEntity";
import { sourceColumnIdSchema } from "#shared/models/resource/sheet/column/transformation/SourceColumnId";
import { z } from "zod";

export interface MathVariable extends Pick<ANamedItemEntity, "name">, SourceColumnId {}

export const mathVariableSchema = z.object({
  ...aNamedItemEntitySchema.pick({ name: true }).shape,
  ...sourceColumnIdSchema.shape,
}) satisfies z.ZodType<MathVariable>;
