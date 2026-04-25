import { trimFileExtension } from "@/util/trimFileExtension";
import { describe, expect, test } from "vitest";

describe(trimFileExtension, () => {
  test("empty string", () => {
    expect.hasAssertions();

    expect(trimFileExtension("")).toBe("");
  });

  test("file extension", () => {
    expect.hasAssertions();

    expect(trimFileExtension(". ")).toBe("");
  });
});
