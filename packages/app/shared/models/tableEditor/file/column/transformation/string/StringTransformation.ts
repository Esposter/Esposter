import type { BasicStringTransformation } from "#shared/models/tableEditor/file/column/transformation/string/BasicStringTransformation";
import type { InterpolateStringTransformation } from "#shared/models/tableEditor/file/column/transformation/string/InterpolateStringTransformation";

import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { interpolateStringTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/string/InterpolateStringTransformation";
import { z } from "zod";

export type StringTransformation = BasicStringTransformation | InterpolateStringTransformation;

export const stringTransformationSchema = z
  .discriminatedUnion("stringTransformationType", [
    // basicStringTransformationSchema,
    interpolateStringTransformationSchema,
  ])
  .meta({ title: ColumnTransformationType.String }) satisfies z.ZodType<StringTransformation>;
