import type { AggregationTransformation } from "#shared/models/tableEditor/file/column/transformation/AggregationTransformation";
import type { ConvertToTransformation } from "#shared/models/tableEditor/file/column/transformation/ConvertToTransformation";
import type { DatePartTransformation } from "#shared/models/tableEditor/file/column/transformation/DatePartTransformation";
import type { MathOperationTransformation } from "#shared/models/tableEditor/file/column/transformation/MathOperationTransformation";
import type { RegexMatchTransformation } from "#shared/models/tableEditor/file/column/transformation/RegexMatchTransformation";
import type { StringPatternTransformation } from "#shared/models/tableEditor/file/column/transformation/StringPatternTransformation";

import { aggregationTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/AggregationTransformation";
import { convertToTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/ConvertToTransformation";
import { datePartTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/DatePartTransformation";
import { mathOperationTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/MathOperationTransformation";
import { regexMatchTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/RegexMatchTransformation";
import { stringPatternTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/StringPatternTransformation";
import { z } from "zod";

export type ColumnTransformation =
  | AggregationTransformation
  | ConvertToTransformation
  | DatePartTransformation
  | MathOperationTransformation
  | RegexMatchTransformation
  | StringPatternTransformation;

export const columnTransformationSchema = z.discriminatedUnion("type", [
  aggregationTransformationSchema,
  convertToTransformationSchema,
  datePartTransformationSchema,
  mathOperationTransformationSchema,
  regexMatchTransformationSchema,
  stringPatternTransformationSchema,
]) satisfies z.ZodType<ColumnTransformation>;
