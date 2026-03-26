import type { BinaryMathStep } from "#shared/models/tableEditor/file/column/transformation/BinaryMathStep";
import type { UnaryMathStep } from "#shared/models/tableEditor/file/column/transformation/UnaryMathStep";

import { binaryMathStepSchema } from "#shared/models/tableEditor/file/column/transformation/BinaryMathStep";
import { unaryMathStepSchema } from "#shared/models/tableEditor/file/column/transformation/UnaryMathStep";
import { z } from "zod";

export type MathStep = BinaryMathStep | UnaryMathStep;

export const mathStepSchema = z.discriminatedUnion("type", [
  unaryMathStepSchema,
  binaryMathStepSchema,
]) satisfies z.ZodType<MathStep>;
