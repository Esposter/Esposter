import type { ColumnTransformation } from "#shared/models/resource/sheet/column/transformation/ColumnTransformation";

import { aggregationTransformationSchema } from "#shared/models/resource/sheet/column/transformation/AggregationTransformation";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { convertToTransformationSchema } from "#shared/models/resource/sheet/column/transformation/ConvertToTransformation";
import { datePartTransformationSchema } from "#shared/models/resource/sheet/column/transformation/DatePartTransformation";
import { mathTransformationSchema } from "#shared/models/resource/sheet/column/transformation/MathTransformation";
import { mathVariableSchema } from "#shared/models/resource/sheet/column/transformation/MathVariable";
import { regexMatchTransformationSchema } from "#shared/models/resource/sheet/column/transformation/RegexMatchTransformation";
import { sourceColumnIdSchema } from "#shared/models/resource/sheet/column/transformation/SourceColumnId";
import { sourceColumnIdsSchema } from "#shared/models/resource/sheet/column/transformation/SourceColumnIds";
import { stringPatternTransformationSchema } from "#shared/models/resource/sheet/column/transformation/string/StringPatternTransformation";
import { stringSplitTransformationSchema } from "#shared/models/resource/sheet/column/transformation/string/StringSplitTransformation";
import { stringTransformationSchema } from "#shared/models/resource/sheet/column/transformation/string/StringTransformation";
import { ColumnFormVjsfContextPropertyNames } from "@/models/resource/sheet/column/ColumnFormVjsfContext";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// Which of the form's context lists feeds a source-column picker is a rendering decision, so the key naming
// It only exists on this side of the boundary — `shared/` states what a transformation is, never how it looks.
const createSourceColumnIdFormShape = (getItems: keyof typeof ColumnFormVjsfContextPropertyNames) => ({
  sourceColumnId: sourceColumnIdSchema.shape.sourceColumnId.meta({
    layout: { comp: "select", getItems },
    title: "Source Column",
  }),
});

// `safeExtend` layers presentation onto the schema the server validates rather than restating it, so a field,
// Constraint or refinement added to a shared transformation reaches the form without being copied here.
const aggregationTransformationFormSchema = aggregationTransformationSchema
  .safeExtend({
    ...createSourceColumnIdFormShape(ColumnFormVjsfContextPropertyNames["context.numberColumnItems"]),
    aggregationTransformationType: aggregationTransformationSchema.shape.aggregationTransformationType.meta({
      title: "Aggregation",
    }),
  })
  .meta({ title: ColumnTransformationType.Aggregation });

const convertToTransformationFormSchema = convertToTransformationSchema
  .safeExtend(createSourceColumnIdFormShape(ColumnFormVjsfContextPropertyNames["context.columnItems"]))
  .meta({ title: ColumnTransformationType.ConvertTo });

const datePartTransformationFormSchema = datePartTransformationSchema
  .safeExtend(createSourceColumnIdFormShape(ColumnFormVjsfContextPropertyNames["context.dateColumnItems"]))
  .meta({ title: ColumnTransformationType.DatePart });

const mathVariableFormSchema = mathVariableSchema.safeExtend(
  createSourceColumnIdFormShape(ColumnFormVjsfContextPropertyNames["context.numberColumnItems"]),
);

const mathTransformationFormSchema = mathTransformationSchema
  .safeExtend({ variables: createUniqueArraySchema(mathVariableFormSchema, "name") })
  .meta({ title: ColumnTransformationType.Math });

const regexMatchTransformationFormSchema = regexMatchTransformationSchema
  .safeExtend(createSourceColumnIdFormShape(ColumnFormVjsfContextPropertyNames["context.stringColumnItems"]))
  .meta({ title: ColumnTransformationType.RegexMatch });

const stringPatternTransformationFormSchema = stringPatternTransformationSchema
  .safeExtend({
    sourceColumnIds: sourceColumnIdsSchema.shape.sourceColumnIds.meta({
      layout: { getItems: ColumnFormVjsfContextPropertyNames["context.columnItems"] },
      title: "Source Columns",
    }),
  })
  .meta({ title: ColumnTransformationType.StringPattern });

const stringSplitTransformationFormSchema = stringSplitTransformationSchema
  .safeExtend(createSourceColumnIdFormShape(ColumnFormVjsfContextPropertyNames["context.stringColumnItems"]))
  .meta({ title: ColumnTransformationType.StringSplit });

const stringTransformationFormSchema = stringTransformationSchema
  .safeExtend(createSourceColumnIdFormShape(ColumnFormVjsfContextPropertyNames["context.stringColumnItems"]))
  .meta({ title: ColumnTransformationType.String });

// Typing the form union as the shared `ColumnTransformation` is what keeps the two halves from drifting: an
// Arm that stops matching the schema the server parses stops compiling here.
export const columnTransformationFormSchema = z.discriminatedUnion("type", [
  aggregationTransformationFormSchema,
  convertToTransformationFormSchema,
  datePartTransformationFormSchema,
  mathTransformationFormSchema,
  regexMatchTransformationFormSchema,
  stringPatternTransformationFormSchema,
  stringSplitTransformationFormSchema,
  stringTransformationFormSchema,
]) satisfies z.ZodType<ColumnTransformation>;
