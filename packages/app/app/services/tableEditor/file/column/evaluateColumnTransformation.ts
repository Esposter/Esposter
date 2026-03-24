import type { ColumnTransformation } from "#shared/models/tableEditor/file/ColumnTransformation";
import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";

import {
  ColumnTransformationType,
  DatePartType,
  MathOperationType,
} from "#shared/models/tableEditor/file/ColumnTransformationType";
import { dayjs } from "#shared/services/dayjs";
import { coerceValue } from "@/services/tableEditor/file/column/coerceValue";

export const evaluateColumnTransformation = (value: ColumnValue, transformation: ColumnTransformation): ColumnValue => {
  switch (transformation.type) {
    case ColumnTransformationType.ConvertTo:
      return coerceValue(value === null ? "" : String(value), transformation.targetType);

    case ColumnTransformationType.DatePart: {
      if (typeof value !== "string") return null;
      const parsed = dayjs(value, transformation.inputFormat, true);
      if (!parsed.isValid()) return null;
      switch (transformation.part) {
        case DatePartType.Day:
          return parsed.date();
        case DatePartType.Hour:
          return parsed.hour();
        case DatePartType.Minute:
          return parsed.minute();
        case DatePartType.Month:
          return parsed.month() + 1;
        case DatePartType.Weekday:
          return parsed.day();
        case DatePartType.Year:
          return parsed.year();
      }
    }

    case ColumnTransformationType.ExtractPattern: {
      if (typeof value !== "string") return null;
      try {
        const match = new RegExp(transformation.pattern).exec(value);
        if (!match) return null;
        return match[transformation.groupIndex] ?? null;
      } catch {
        return null;
      }
    }

    case ColumnTransformationType.MathOperation: {
      if (typeof value !== "number") return null;
      const { operand } = transformation;
      switch (transformation.operation) {
        case MathOperationType.Abs:
          return Math.abs(value);
        case MathOperationType.Add:
          return operand !== undefined ? value + operand : null;
        case MathOperationType.Ceil:
          return Math.ceil(value);
        case MathOperationType.Divide:
          return operand !== undefined && operand !== 0 ? value / operand : null;
        case MathOperationType.Floor:
          return Math.floor(value);
        case MathOperationType.Multiply:
          return operand !== undefined ? value * operand : null;
        case MathOperationType.Round:
          return Math.round(value);
        case MathOperationType.Subtract:
          return operand !== undefined ? value - operand : null;
      }
    }
  }
};
