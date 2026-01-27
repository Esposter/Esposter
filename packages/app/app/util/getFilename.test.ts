import { getFilename } from "@/util/getFilename";
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
