import { checkStartsWithNumber } from "#shared/util/regex/checkStartsWithNumber";
import { describe, expect, test } from "vitest";

describe(checkStartsWithNumber, () => {
  test("rejects an empty string", () => {
    expect.hasAssertions();

    expect(checkStartsWithNumber("")).toBe(false);
  });

  test("accepts a string starting with a digit", () => {
    expect.hasAssertions();

    expect(checkStartsWithNumber("0")).toBe(true);
  });
});
