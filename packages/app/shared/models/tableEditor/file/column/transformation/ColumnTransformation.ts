import { convertToTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/ConvertToTransformation";
import { datePartTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/DatePartTransformation";
import { mathOperationTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/MathOperationTransformation";
import { regexMatchTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/RegexMatchTransformation";
import { stringPatternTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/StringPatternTransformation";
import { z } from "zod";

export const columnTransformationSchema = z.discriminatedUnion("type", [
  convertToTransformationSchema,
  datePartTransformationSchema,
  mathOperationTransformationSchema,
  regexMatchTransformationSchema,
  stringPatternTransformationSchema,
]);

export type ColumnTransformation = z.infer<typeof columnTransformationSchema>;
