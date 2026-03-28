import type { AggregationTransformation } from "#shared/models/tableEditor/file/column/transformation/AggregationTransformation";
import type { ConvertToTransformation } from "#shared/models/tableEditor/file/column/transformation/ConvertToTransformation";
import type { DatePartTransformation } from "#shared/models/tableEditor/file/column/transformation/DatePartTransformation";
import type { MathTransformation } from "#shared/models/tableEditor/file/column/transformation/MathTransformation";
import type { RegexMatchTransformation } from "#shared/models/tableEditor/file/column/transformation/RegexMatchTransformation";
import type { StringTransformation } from "#shared/models/tableEditor/file/column/transformation/string/StringTransformation";

import { aggregationTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/AggregationTransformation";
import { convertToTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/ConvertToTransformation";
import { datePartTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/DatePartTransformation";
import { mathTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/MathTransformation";
import { regexMatchTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/RegexMatchTransformation";
import { stringTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/string/StringTransformation";
import { z } from "zod";

export type ColumnTransformation =
  | AggregationTransformation
  | ConvertToTransformation
  | DatePartTransformation
  | MathTransformation
  | RegexMatchTransformation
  | StringTransformation;

export const columnTransformationSchema = z.discriminatedUnion("type", [
  aggregationTransformationSchema,
  convertToTransformationSchema,
  datePartTransformationSchema,
  mathTransformationSchema,
  regexMatchTransformationSchema,
  stringTransformationSchema,
]) satisfies z.ZodType<ColumnTransformation>;
