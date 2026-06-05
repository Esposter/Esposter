import { getFileSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");
const isWindows = process.platform === "win32";

describe("@esposter/xml2js", () => {
  test("bundle size", () => {
    expect.hasAssertions();

    if (isWindows) expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 1121.62 KB (1148535 bytes)"`);
    else expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 1121.62 KB (1148535 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();

    if (isWindows) expect(getFileSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 37.11 KB (37996 bytes)"`);
    else expect(getFileSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 37.11 KB (37996 bytes)"`);
  });
});
