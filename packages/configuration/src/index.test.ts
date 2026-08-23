import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

import { getFileSize } from "./getFileSize";

describe("@esposter/configuration", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");
  const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");

  test("bundle size", () => {
    expect.hasAssertions();
    expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 4.06 KB (4158 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();
    expect(getFileSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 2.50 KB (2564 bytes)"`);
  });
});
