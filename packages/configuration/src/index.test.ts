import { getFileSizeReport } from "#src/services/getFileSizeReport";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("@esposter/configuration", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");

  test("bundle size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distFile)).toMatchInlineSnapshot(`"index.js: 12.60 KB (12900 bytes)"`);
  });
});
