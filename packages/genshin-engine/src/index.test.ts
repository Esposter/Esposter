import { getFileSizeReport } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("genshin-engine", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");
  const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");

  test("bundle size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distFile)).toMatchInlineSnapshot(`"index.js: 58.65 KB (60057 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 21.94 KB (22466 bytes)"`);
  });
});
