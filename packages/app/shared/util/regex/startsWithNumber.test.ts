import { startsWithNumber } from "#shared/util/regex/startsWithNumber";
import { describe, expect, test } from "vitest";

describe(startsWithNumber, () => {
  test("empty string", () => {
    expect.hasAssertions();

    expect(startsWithNumber("")).toBe(false);
  });

  test("number", () => {
    expect.hasAssertions();

    expect(startsWithNumber("0")).toBe(true);
  });
});
