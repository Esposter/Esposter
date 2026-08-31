import { getFileSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("vue-phaserjs", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");
  const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");

  test.skipIf(process.platform !== "win32")("bundle size (Windows)", () => {
    expect.hasAssertions();
    expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 59.64 KB (61074 bytes)"`);
  });

  test.skipIf(process.platform === "win32")("bundle size (POSIX)", () => {
    expect.hasAssertions();
    expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 59.61 KB (61038 bytes)"`);
  });

  test.skipIf(process.platform !== "win32")("types size (Windows)", () => {
    expect.hasAssertions();
    expect(getFileSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 522.62 KB (535163 bytes)"`);
  });

  test.skipIf(process.platform === "win32")("types size (POSIX)", () => {
    expect.hasAssertions();
    expect(getFileSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 522.78 KB (535327 bytes)"`);
  });
});
