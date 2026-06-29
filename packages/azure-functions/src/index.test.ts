import { getFileSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");

describe("@esposter/azure-functions", () => {
  // The JS bundle byte count differs on Windows (CRLF) vs POSIX (LF), so each platform gets its own
  // Test guarded by skipIf with its own auto-updatable snapshot — only the matching OS's snapshot
  // Runs, so neither needs a conditional inside the test (no vitest/no-conditional-* disable).
  test.skipIf(process.platform !== "win32")("bundle size (Windows)", () => {
    expect.hasAssertions();
    expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 4658.60 KB (4770402 bytes)"`);
  });

  test.skipIf(process.platform === "win32")("bundle size (POSIX)", () => {
    expect.hasAssertions();
    expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 4664.16 KB (4776100 bytes)"`);
  });
});
