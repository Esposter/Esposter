import { statSync } from "fs";
import { resolve } from "path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");

describe("@esposter/azure-functions", () => {
  test("bundle size", () => {
    expect.hasAssertions();
    expect(statSync(distFile).size).toMatchInlineSnapshot(`4396406`);
  });
});
