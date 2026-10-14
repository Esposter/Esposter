import { MAX_AGENT_READ_SIZE } from "#server/services/resource/constants";
import { readContentAtPointer } from "#server/services/resource/readContentAtPointer";
import { describe, expect, test } from "vitest";

describe(readContentAtPointer, () => {
  const page = { limit: 2, offset: 1 };

  test("reads the value at the pointer", () => {
    expect.hasAssertions();

    expect(readContentAtPointer({ a: { b: "" } }, { ...page, pointer: "/a" })).toStrictEqual({ content: { b: "" } });
  });

  test("reads a page of an array, its length beside it", () => {
    expect.hasAssertions();

    expect(readContentAtPointer({ a: [0, 1, 2, 3] }, { ...page, pointer: "/a" })).toStrictEqual({
      content: [1, 2],
      length: 4,
    });
  });

  test("reads content never saved as null", () => {
    expect.hasAssertions();

    expect(readContentAtPointer(null, { ...page, pointer: "" })).toStrictEqual({ content: null });
  });

  test("answers each member's size in place of an object past the cap", () => {
    expect.hasAssertions();

    expect(readContentAtPointer({ a: "a".repeat(MAX_AGENT_READ_SIZE), b: "" }, { ...page, pointer: "" })).toStrictEqual(
      { memberSizes: { a: MAX_AGENT_READ_SIZE + 2, b: 2 } },
    );
  });

  test("answers each item's size, by its index, in place of a page past the cap", () => {
    expect.hasAssertions();

    expect(readContentAtPointer(["", "", "a".repeat(MAX_AGENT_READ_SIZE)], { ...page, pointer: "" })).toStrictEqual({
      length: 3,
      memberSizes: { 1: 2, 2: MAX_AGENT_READ_SIZE + 2 },
    });
  });

  test("answers a leaf's size in place of a value past the cap", () => {
    expect.hasAssertions();

    expect(readContentAtPointer("a".repeat(MAX_AGENT_READ_SIZE), { ...page, pointer: "" })).toStrictEqual({
      size: MAX_AGENT_READ_SIZE + 2,
    });
  });

  test("refuses a pointer to nothing", () => {
    expect.hasAssertions();

    expect(() => readContentAtPointer({}, { ...page, pointer: "/a" })).toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Read, name: /a, no such member]`,
    );
  });
});
