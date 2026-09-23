import { getFileSizeReport } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("@esposter/db-schema", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");

  test("bundle size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distFile)).toMatchInlineSnapshot(`"index.js: 105.58 KB (108114 bytes)"`);
  });
});
