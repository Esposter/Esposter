import { getFilename } from "@/util/file/getFilename";
import { describe, expect, test } from "vitest";

describe(getFilename, () => {
  test("empty string", () => {
    expect.hasAssertions();

    expect(getFilename("")).toBe("");
  });

  test("filename", () => {
    expect.hasAssertions();

    expect(getFilename("/")).toBe("");
  });
});
