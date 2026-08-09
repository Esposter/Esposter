import type { SourceColumnId } from "#shared/models/resource/sheet/column/transformation/SourceColumnId";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { sourceColumnIdSchema } from "#shared/models/resource/sheet/column/transformation/SourceColumnId";
import {
  StringTransformationType,
  stringTransformationTypeSchema,
} from "#shared/models/resource/sheet/column/transformation/string/StringTransformationType";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface StringTransformation extends ItemEntityType<ColumnTransformationType.String>, SourceColumnId {
  stringTransformationType: StringTransformationType;
}

export const stringTransformationSchema = z.object({
  ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.String).readonly()).shape,
  ...sourceColumnIdSchema.shape,
  stringTransformationType: stringTransformationTypeSchema,
}) satisfies z.ZodType<StringTransformation>;
