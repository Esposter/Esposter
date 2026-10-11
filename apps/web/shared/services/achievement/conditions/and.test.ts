import { and } from "#shared/services/achievement/conditions/and";
import { describe, expect, test } from "vitest";

const hasMessage = (input: { message: string }) => input.message !== "";
const isShort = (input: { message: string }) => input.message.length < 5;

describe(and, () => {
  test("holds only when every predicate holds", () => {
    expect.hasAssertions();

    const isValid = and(hasMessage, isShort);

    expect(isValid({ message: "a" })).toBe(true);
    expect(isValid({ message: "" })).toBe(false);
    expect(isValid({ message: "abcdef" })).toBe(false);
  });
});
