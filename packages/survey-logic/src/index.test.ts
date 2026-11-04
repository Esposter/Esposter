import { getFileSize, KIBIBYTE } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("survey-logic", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");

  test("bundle size", () => {
    expect.hasAssertions();

    expect(getFileSize(distFile)).toBeLessThanOrEqual(64 * KIBIBYTE);
  });
});
