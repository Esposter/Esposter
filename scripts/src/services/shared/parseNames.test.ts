import { parseNames } from "#src/services/shared/parseNames";
import { describe, expect, test } from "vitest";

describe(parseNames, () => {
  test("parses comma-separated names, dropping empty entries", () => {
    expect.hasAssertions();

    expect(parseNames(" a,,b ", "only")).toStrictEqual(["a", "b"]);
  });

  test("rejects a value that names nothing", () => {
    expect.hasAssertions();

    expect(() => parseNames(" , ", "only")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: only,  ,  names nothing]`,
    );
  });
});
