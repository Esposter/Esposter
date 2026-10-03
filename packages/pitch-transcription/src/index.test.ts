import { getFileSizeReport } from "@esposter/configuration";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, test } from "vitest";

describe("pitch-transcription", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");
  const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");

  test("bundle size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distFile)).toMatchInlineSnapshot(`"index.js: 4.31 KB (4418 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 2.98 KB (3052 bytes)"`);
  });

  // Under Node with no bundler, which sees only the named exports a CommonJS dependency's own analysis finds; the test
  // Runner's interop would hide a missing one
  test("loads under plain Node", () => {
    expect.hasAssertions();

    const output = execFileSync(process.execPath, [
      "--input-type=module",
      "--eval",
      `const { writeMidi } = await import(${JSON.stringify(pathToFileURL(distFile).href)}); console.log(writeMidi([]).length > 0);`,
    ]);

    expect(output.toString().trim()).toBe("true");
  });
});
