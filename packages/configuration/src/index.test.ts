import { KIBIBYTE } from "#src/services/constants";
import { getFileSize } from "#src/services/getFileSize";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("@esposter/configuration", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");

  test("bundle size", () => {
    expect.hasAssertions();

    expect(getFileSize(distFile)).toBeLessThanOrEqual(16 * KIBIBYTE);
  });
});
