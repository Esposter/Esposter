import { getFileSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const isWindows = process.platform === "win32";

describe("@esposter/azure-functions", () => {
  test("bundle size", () => {
    expect.hasAssertions();

    if (isWindows) expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 4228.27 KB (4329753 bytes)"`);
    else expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 4234.19 KB (4335809 bytes)"`);
  });
});
