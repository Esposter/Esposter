import { statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");

describe("@esposter/db-schema", () => {
  test("bundle size", () => {
    expect.hasAssertions();
    expect(statSync(distFile).size).toMatchInlineSnapshot(`65963`);
  });
});
