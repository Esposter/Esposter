import { statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");

describe("@esposter/db", () => {
  test("bundle size", () => {
    expect.hasAssertions();
    expect(statSync(distFile).size).toMatchInlineSnapshot(`1118858`);
  });
});
