import { getFileSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");
const isWindows = process.platform === "win32";

describe("@esposter/shared", () => {
  test("bundle size", () => {
    expect.hasAssertions();

    if (isWindows) expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 383.91 KB (393119 bytes)"`);
    else expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 383.84 KB (393050 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();

    if (isWindows) expect(getFileSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 109.98 KB (112623 bytes)"`);
    else expect(getFileSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 106.03 KB (108576 bytes)"`);
  });
});
