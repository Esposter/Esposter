import { getRandomValue } from "@/util/math/random/getRandomValue";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getRandomValue, () => {
  test("gets", () => {
    expect.hasAssertions();

    expect(getRandomValue([""])).toBe("");
  });

  test("fails for empty values", () => {
    expect.hasAssertions();

    expect(() => getRandomValue("")).toThrowError(
      new InvalidOperationError(Operation.Read, getRandomValue.name, "cannot pick random value from empty values"),
    );
  });

  test("fails for empty array", () => {
    expect.hasAssertions();

    expect(() => getRandomValue([])).toThrowError(
      new InvalidOperationError(Operation.Read, getRandomValue.name, "cannot pick random value from empty values"),
    );
  });
});
