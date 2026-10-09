import { resolveFolders } from "#src/services/fleet/data/resolveFolders";
import { describe, expect, test } from "vitest";

describe(resolveFolders, () => {
  test("splits the comma-separated folders", () => {
    expect.hasAssertions();

    expect(resolveFolders("extracted, text")).toStrictEqual(["extracted", "text"]);
  });

  test("refuses frames and tmp, which are never copied", () => {
    expect.hasAssertions();

    expect(() => resolveFolders("text,frames")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: fleet data, frames are never copied]`,
    );
  });
});
