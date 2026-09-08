import { getFileSizeReport } from "#src/getFileSizeReport";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("@esposter/configuration", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");

  test("bundle size", () => {
    expect.hasAssertions();
    expect(getFileSizeReport(distFile)).toMatchInlineSnapshot(`"index.js: 6.28 KB (6434 bytes)"`);
  });
});
