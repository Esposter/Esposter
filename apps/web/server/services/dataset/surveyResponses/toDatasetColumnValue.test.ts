import { toDatasetColumnValue } from "#server/services/dataset/surveyResponses/toDatasetColumnValue";
import { describe, expect, test } from "vitest";

describe(toDatasetColumnValue, () => {
  test("joins a checkbox's answers into one cell", () => {
    expect.hasAssertions();

    expect(toDatasetColumnValue(["Email", "Phone"])).toBe("Email; Phone");
  });

  test("writes a Date as its ISO string", () => {
    expect.hasAssertions();

    expect(toDatasetColumnValue(new Date("2026-01-02T03:04:05.000Z"))).toBe("2026-01-02T03:04:05.000Z");
  });
});
