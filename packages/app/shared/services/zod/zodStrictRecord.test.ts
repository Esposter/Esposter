import { zodStrictRecord } from "#shared/services/zod/zodStrictRecord";
import { AllSpecialValues } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(zodStrictRecord, () => {
  const schema = zodStrictRecord(z.string(), z.string());

  test("validates a strict record", () => {
    expect.hasAssertions();

    const result = schema.safeParse({ "": "" });

    expect(result.success).toBe(true);
  });

  test("invalidates when keys are incorrect", () => {
    expect.hasAssertions();

    const numberKeySchema = zodStrictRecord(z.number(), z.number());
    const result = numberKeySchema.safeParse({ 0: "" });

    expect(result.success).toBe(false);
  });

  test("invalidates when values are incorrect", () => {
    expect.hasAssertions();

    const result = schema.safeParse({ "": 0 });

    expect(result.success).toBe(false);
  });

  test("invalidates when input is not an object", () => {
    expect.hasAssertions();

    for (const { isPlainObject, value } of AllSpecialValues)
      expect(schema.safeParse(value).success).toBe(isPlainObject);
  });
});
