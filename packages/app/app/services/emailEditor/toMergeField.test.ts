import { toMergeField } from "@/services/emailEditor/toMergeField";
import { describe, expect, test } from "vitest";

describe(toMergeField, () => {
  test("wraps column name in double braces", () => {
    expect.hasAssertions();

    expect(toMergeField("a")).toBe("{{a}}");
  });
});
