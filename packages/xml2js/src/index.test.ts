import { getCrossPlatformSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const isWindows = process.platform === "win32";

describe("@esposter/xml2js", () => {
  test("bundle size", () => {
    expect.hasAssertions();

    expect(getCrossPlatformSize(distFile)).toMatchInlineSnapshot(
      isWindows ? `"index.js: 1117.27 KB (1144087 bytes)"` : `"index.js: 1193.05 KB (1221687 bytes)"`,
    );
  });
});
