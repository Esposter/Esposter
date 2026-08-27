import { checkStartsWithNumber } from "#shared/util/regex/checkStartsWithNumber";
import { describe, expect, test } from "vitest";

describe(checkStartsWithNumber, () => {
  test("empty string", () => {
    expect.hasAssertions();

    expect(checkStartsWithNumber("")).toBe(false);
  });

  test("number", () => {
    expect.hasAssertions();

    expect(checkStartsWithNumber("0")).toBe(true);
  });
});
