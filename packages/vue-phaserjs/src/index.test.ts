import { getFileSizeReport } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("vue-phaserjs", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");
  const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");

  test("bundle size", () => {
    expect.hasAssertions();
    expect(getFileSizeReport(distFile)).toMatchInlineSnapshot(`"index.js: 59.89 KB (61332 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();
    expect(getFileSizeReport(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 536.37 KB (549246 bytes)"`);
  });
});
