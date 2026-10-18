import { toDatasetColumnValue } from "#server/services/dataset/surveyResponses/toDatasetColumnValue";
import { CHECKBOX_ANSWER_SEPARATOR } from "#shared/services/resource/survey/constants";
import { describe, expect, test } from "vitest";

describe(toDatasetColumnValue, () => {
  test("joins a checkbox's answers into one cell", () => {
    expect.hasAssertions();

    expect(toDatasetColumnValue(["Email", "Phone"])).toBe(`Email${CHECKBOX_ANSWER_SEPARATOR}Phone`);
  });

  test("writes a Date as its ISO string", () => {
    expect.hasAssertions();

    const date = new Date(0);

    expect(toDatasetColumnValue(date)).toBe(date.toISOString());
  });
});
