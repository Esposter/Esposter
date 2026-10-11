import { or } from "#shared/services/achievement/conditions/or";
import { describe, expect, test } from "vitest";

const isEmpty = (input: { message: string }) => input.message === "";
const isLong = (input: { message: string }) => input.message.length > 4;

describe(or, () => {
  test("holds when any predicate holds", () => {
    expect.hasAssertions();

    const isEdge = or(isEmpty, isLong);

    expect(isEdge({ message: "" })).toBe(true);
    expect(isEdge({ message: "abcdef" })).toBe(true);
    expect(isEdge({ message: "abc" })).toBe(false);
  });
});
