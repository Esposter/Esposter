import {
  ColumnTransformationType,
  DatePartType,
  MathOperationType,
} from "#shared/models/tableEditor/file/ColumnTransformationType";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { evaluateColumnTransformation } from "@/services/tableEditor/file/column/evaluateColumnTransformation";
import { describe, expect, test } from "vitest";

describe(evaluateColumnTransformation, () => {
  describe(`${ColumnTransformationType.ConvertTo}`, () => {
    test("converts string to number", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation("0.1", {
          type: ColumnTransformationType.ConvertTo,
          targetType: ColumnType.Number,
        }),
      ).toBe(0.1);
    });

    test("converts string to boolean", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation("true", {
          type: ColumnTransformationType.ConvertTo,
          targetType: ColumnType.Boolean,
        }),
      ).toBe(true);
      expect(
        evaluateColumnTransformation("false", {
          type: ColumnTransformationType.ConvertTo,
          targetType: ColumnType.Boolean,
        }),
      ).toBe(false);
    });

    test("returns null for empty string", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation("", { type: ColumnTransformationType.ConvertTo, targetType: ColumnType.Number }),
      ).toBeNull();
    });

    test("returns null for NaN input", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation(String(Number.NaN), {
          type: ColumnTransformationType.ConvertTo,
          targetType: ColumnType.Number,
        }),
      ).toBeNull();
    });

    test("passes string through as string", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation(" ", { type: ColumnTransformationType.ConvertTo, targetType: ColumnType.String }),
      ).toBe(" ");
    });

    test("passes date string through as string", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation("1970-01-01", {
          type: ColumnTransformationType.ConvertTo,
          targetType: ColumnType.Date,
        }),
      ).toBe("1970-01-01");
    });
  });

  describe(`${ColumnTransformationType.ExtractPattern}`, () => {
    test("extracts regex capture group", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation("user@example.com", {
          type: ColumnTransformationType.ExtractPattern,
          pattern: "@(.+)",
          groupIndex: 1,
        }),
      ).toBe("example.com");
    });

    test("returns null when pattern does not match", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation("nodomain", {
          type: ColumnTransformationType.ExtractPattern,
          pattern: "@(.+)",
          groupIndex: 1,
        }),
      ).toBeNull();
    });

    test("returns null for non-string value", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation(0, {
          type: ColumnTransformationType.ExtractPattern,
          pattern: "(.+)",
          groupIndex: 1,
        }),
      ).toBeNull();
    });

    test("returns null when group index is out of range", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation("abc", {
          type: ColumnTransformationType.ExtractPattern,
          pattern: "(abc)",
          groupIndex: 2,
        }),
      ).toBeNull();
    });
  });

  describe(`${ColumnTransformationType.MathOperation}`, () => {
    test("multiplies by operand", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation(0.1, {
          type: ColumnTransformationType.MathOperation,
          operation: MathOperationType.Multiply,
          operand: 2,
        }),
      ).toBeCloseTo(0.2);
    });

    test("divides by operand", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation(0.1, {
          type: ColumnTransformationType.MathOperation,
          operation: MathOperationType.Divide,
          operand: 2,
        }),
      ).toBeCloseTo(0.05);
    });

    test("returns null when dividing by zero", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation(1, {
          type: ColumnTransformationType.MathOperation,
          operation: MathOperationType.Divide,
          operand: 0,
        }),
      ).toBeNull();
    });

    test("adds operand", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation(0, {
          type: ColumnTransformationType.MathOperation,
          operation: MathOperationType.Add,
          operand: 1,
        }),
      ).toBe(1);
    });

    test("subtracts operand", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation(1, {
          type: ColumnTransformationType.MathOperation,
          operation: MathOperationType.Subtract,
          operand: 1,
        }),
      ).toBe(0);
    });

    test("rounds to nearest integer", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation(0.1, {
          type: ColumnTransformationType.MathOperation,
          operation: MathOperationType.Round,
        }),
      ).toBe(0);
    });

    test("floors to integer", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation(0.1, {
          type: ColumnTransformationType.MathOperation,
          operation: MathOperationType.Floor,
        }),
      ).toBe(0);
    });

    test("ceils to integer", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation(0.1, {
          type: ColumnTransformationType.MathOperation,
          operation: MathOperationType.Ceil,
        }),
      ).toBe(1);
    });

    test("returns absolute value", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation(-1, {
          type: ColumnTransformationType.MathOperation,
          operation: MathOperationType.Abs,
        }),
      ).toBe(1);
    });

    test("returns null for non-number value", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation("0", {
          type: ColumnTransformationType.MathOperation,
          operation: MathOperationType.Multiply,
          operand: 2,
        }),
      ).toBeNull();
    });

    test("returns null when operand is missing for binary operation", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation(1, {
          type: ColumnTransformationType.MathOperation,
          operation: MathOperationType.Multiply,
        }),
      ).toBeNull();
    });
  });

  describe(`${ColumnTransformationType.DatePart}`, () => {
    test("extracts year", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation("1970-01-01", {
          type: ColumnTransformationType.DatePart,
          part: DatePartType.Year,
          inputFormat: "YYYY-MM-DD",
        }),
      ).toBe(1970);
    });

    test("extracts month (1-indexed)", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation("1970-01-01", {
          type: ColumnTransformationType.DatePart,
          part: DatePartType.Month,
          inputFormat: "YYYY-MM-DD",
        }),
      ).toBe(1);
    });

    test("extracts day", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation("1970-01-02", {
          type: ColumnTransformationType.DatePart,
          part: DatePartType.Day,
          inputFormat: "YYYY-MM-DD",
        }),
      ).toBe(2);
    });

    test("extracts hour", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation("1970-01-01T00:00:00", {
          type: ColumnTransformationType.DatePart,
          part: DatePartType.Hour,
          inputFormat: "YYYY-MM-DDTHH:mm:ss",
        }),
      ).toBe(0);
    });

    test("extracts minute", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation("1970-01-01T00:00:00", {
          type: ColumnTransformationType.DatePart,
          part: DatePartType.Minute,
          inputFormat: "YYYY-MM-DDTHH:mm:ss",
        }),
      ).toBe(0);
    });

    test("returns null for invalid date", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation("not-a-date", {
          type: ColumnTransformationType.DatePart,
          part: DatePartType.Year,
          inputFormat: "YYYY-MM-DD",
        }),
      ).toBeNull();
    });

    test("returns null for non-string value", () => {
      expect.hasAssertions();
      expect(
        evaluateColumnTransformation(0, {
          type: ColumnTransformationType.DatePart,
          part: DatePartType.Year,
          inputFormat: "YYYY-MM-DD",
        }),
      ).toBeNull();
    });
  });
});
