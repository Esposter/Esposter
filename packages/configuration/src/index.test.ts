import { getFileSize } from "#src/getFileSize";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("@esposter/configuration", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");

  test("bundle size", () => {
    expect.hasAssertions();
    expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 5.84 KB (5985 bytes)"`);
  });
});
