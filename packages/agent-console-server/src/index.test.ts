import { getFileSize, KIBIBYTE } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("agent-console-server", () => {
  const distDirectory = resolve(import.meta.dirname, "../dist");

  test("bundle size", () => {
    expect.hasAssertions();

    expect(getFileSize(resolve(distDirectory, "index.js"))).toBeLessThanOrEqual(16 * KIBIBYTE);
    expect(getFileSize(resolve(distDirectory, "contracts.js"))).toBeLessThanOrEqual(4 * KIBIBYTE);
  });

  test("types size", () => {
    expect.hasAssertions();

    expect(getFileSize(resolve(distDirectory, "index.d.ts"))).toBeLessThanOrEqual(64 * KIBIBYTE);
    expect(getFileSize(resolve(distDirectory, "contracts.d.ts"))).toBeLessThanOrEqual(16 * KIBIBYTE);
  });
});
