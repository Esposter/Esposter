import { parseNumbers } from "#src/services/shared/parseNumbers";
import { describe, expect, test } from "vitest";

describe(parseNumbers, () => {
  test("parses comma-separated numbers", () => {
    expect.hasAssertions();

    expect(parseNumbers("0,-1.5", "at", 2)).toStrictEqual([0, -1.5]);
  });

  test("rejects a count other than the one given", () => {
    expect.hasAssertions();

    expect(() => parseNumbers("0", "at", 2)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: at, 0 is not 2 comma-separated numbers]`,
    );
  });

  test("rejects an entry that is not a number", () => {
    expect.hasAssertions();

    expect(() => parseNumbers("0,nope", "at")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: at, 0,nope holds nope, not a number]`,
    );
  });

  test("rejects an empty entry", () => {
    expect.hasAssertions();

    expect(() => parseNumbers("0,", "at")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: at, 0, holds an empty entry, not a number]`,
    );
  });
});
