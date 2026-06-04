import { getFileSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");
const isWindows = process.platform === "win32";

describe("@esposter/db-schema", () => {
  test("bundle size", () => {
    expect.hasAssertions();

    if (isWindows) expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 64.59 KB (66142 bytes)"`);
    else expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 64.45 KB (66001 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();

    if (isWindows) expect(getFileSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 3632.85 KB (3720037 bytes)"`);
    else expect(getFileSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 3636.03 KB (3723293 bytes)"`);
  });
});
