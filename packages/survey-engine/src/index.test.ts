import { getFileSize, KIBIBYTE } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("survey-engine", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");

  test("bundle size", () => {
    expect.hasAssertions();

    expect(getFileSize(distFile)).toBeLessThanOrEqual(128 * KIBIBYTE);
  });
});
