// The JS bundle byte count differs on Windows (CRLF) vs POSIX (LF), so each platform needs its own
// Auto-updatable inline snapshot, which requires a runtime conditional inside the test.
/* eslint-disable vitest/no-conditional-expect, vitest/no-conditional-in-test */
import { getFileSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const isWindows = process.platform === "win32";

describe("@esposter/azure-functions", () => {
  test("bundle size", () => {
    expect.hasAssertions();

    if (isWindows) expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 4707.62 KB (4820598 bytes)"`);
    else expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 4713.31 KB (4826425 bytes)"`);
  });
});
