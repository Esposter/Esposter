import type { ColumnTransformation } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformation";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { DatePartType } from "#shared/models/tableEditor/file/column/transformation/DatePartType";
import { MathOperationType } from "#shared/models/tableEditor/file/column/transformation/MathOperationType";
import { DATE_FORMATS } from "#shared/models/tableEditor/file/constants";
import { takeOne } from "@esposter/shared";

export const ColumnTransformationTypeCreateMap = {
  [ColumnTransformationType.ConvertTo]: {
    create: (): ColumnTransformation => ({
      sourceColumnId: "",
      targetType: ColumnType.String,
      type: ColumnTransformationType.ConvertTo,
    }),
  },
  [ColumnTransformationType.DatePart]: {
    create: (): ColumnTransformation => ({
      inputFormat: takeOne(DATE_FORMATS, 7),
      part: DatePartType.Year,
      sourceColumnId: "",
      type: ColumnTransformationType.DatePart,
    }),
  },
  [ColumnTransformationType.MathOperation]: {
    create: (): ColumnTransformation => ({
      operand: 1,
      operation: MathOperationType.Multiply,
      sourceColumnId: "",
      type: ColumnTransformationType.MathOperation,
    }),
  },
  [ColumnTransformationType.RegexMatch]: {
    create: (): ColumnTransformation => ({
      groupIndex: 0,
      pattern: "",
      sourceColumnId: "",
      type: ColumnTransformationType.RegexMatch,
    }),
  },
} as const satisfies Record<ColumnTransformationType, { create: () => ColumnTransformation }>;
