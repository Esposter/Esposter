import { MAX_AGENT_READ_SIZE } from "#server/services/resource/constants";
import { readContentAtPointer } from "#server/services/resource/readContentAtPointer";
import { encodePageCursor, START_PAGE_CURSOR } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

const cursorAt = (index: number) => ({ isBackward: false, values: [index] });

describe(readContentAtPointer, () => {
  const limit = 2;
  const page = { cursor: cursorAt(1), limit };

  test("reads the value at the pointer", () => {
    expect.hasAssertions();

    expect(readContentAtPointer({ a: { b: "" } }, { ...page, pointer: "/a" })).toStrictEqual({
      content: { b: "" },
      nextCursor: "",
    });
  });

  test("reads a page of an array, its length beside it and the cursor of the next", () => {
    expect.hasAssertions();

    expect(readContentAtPointer({ a: [0, 1, 2, 3] }, { ...page, pointer: "/a" })).toStrictEqual({
      content: [1, 2],
      length: 4,
      nextCursor: encodePageCursor(cursorAt(3)),
    });
  });

  test("reads an array to its end a page at a time, from the cursor each page answered", () => {
    expect.hasAssertions();

    const content = { a: [0, 1, 2, 3, 4] };
    const first = readContentAtPointer(content, { cursor: START_PAGE_CURSOR, limit, pointer: "/a" });
    const second = readContentAtPointer(content, { cursor: cursorAt(2), limit, pointer: "/a" });
    const last = readContentAtPointer(content, { cursor: cursorAt(4), limit, pointer: "/a" });

    expect(first).toStrictEqual({ content: [0, 1], length: 5, nextCursor: encodePageCursor(cursorAt(2)) });
    expect(second).toStrictEqual({ content: [2, 3], length: 5, nextCursor: encodePageCursor(cursorAt(4)) });
    expect(last).toStrictEqual({ content: [4], length: 5, nextCursor: "" });
  });

  test("reads content never saved as null", () => {
    expect.hasAssertions();

    expect(readContentAtPointer(null, { ...page, pointer: "" })).toStrictEqual({ content: null, nextCursor: "" });
  });

  test("answers each member's size in place of an object past the cap", () => {
    expect.hasAssertions();

    expect(readContentAtPointer({ a: "a".repeat(MAX_AGENT_READ_SIZE), b: "" }, { ...page, pointer: "" })).toStrictEqual(
      { memberSizes: { a: MAX_AGENT_READ_SIZE + 2, b: 2 }, nextCursor: "" },
    );
  });

  test("answers each item's size, by its index, in place of a page past the cap", () => {
    expect.hasAssertions();

    expect(readContentAtPointer(["", "", "a".repeat(MAX_AGENT_READ_SIZE)], { ...page, pointer: "" })).toStrictEqual({
      length: 3,
      memberSizes: { 1: 2, 2: MAX_AGENT_READ_SIZE + 2 },
      nextCursor: "",
    });
  });

  test("answers a leaf's size in place of a value past the cap", () => {
    expect.hasAssertions();

    expect(readContentAtPointer("a".repeat(MAX_AGENT_READ_SIZE), { ...page, pointer: "" })).toStrictEqual({
      nextCursor: "",
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
