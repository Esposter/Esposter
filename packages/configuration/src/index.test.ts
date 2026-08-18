import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

import { getFileSize } from "./getFileSize";

describe("@esposter/configuration", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");
  const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");

  test("bundle size", () => {
    expect.hasAssertions();
    expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 3.79 KB (3882 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();
    expect(getFileSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 1.26 KB (1288 bytes)"`);
  });
});
