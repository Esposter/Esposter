import { mathOperationTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/MathOperationTransformation";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { describe, expect, test } from "vitest";

describe("mathOperationTransformation", () => {
  test("produces correct json schema for vjsf", () => {
    expect.hasAssertions();

    expect(zodToJsonSchema(mathOperationTransformationSchema)).toMatchInlineSnapshot();
  });
});
