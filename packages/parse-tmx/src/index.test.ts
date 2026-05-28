import { getCrossPlatformSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const isWindows = process.platform === "win32";

describe("parse-tmx", () => {
  test("bundle size", () => {
    expect.hasAssertions();

    if (isWindows) expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 815.41 KB (834980 bytes)"`);
    else expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(`"index.js: 815.41 KB (834980 bytes)"`);
  });
});
