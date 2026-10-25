import { getFilename } from "@/util/file/getFilename";
import { describe, expect, test } from "vitest";

describe(getFilename, () => {
  test("returns the segment after the last slash", () => {
    expect.hasAssertions();

    expect(getFilename("a/b/c")).toBe("c");
  });

  test("returns a name with no slash as it is", () => {
    expect.hasAssertions();

    expect(getFilename("a")).toBe("a");
  });
});
