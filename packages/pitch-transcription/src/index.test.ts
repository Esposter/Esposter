import { getFileSizeReport } from "@esposter/configuration";
import { execFileSync } from "@esposter/shared-node/child-process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, test } from "vitest";

describe("pitch-transcription", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");
  const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");
  const distNotesFile = resolve(import.meta.dirname, "../dist/notes.js");

  test("bundle size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distFile)).toMatchInlineSnapshot(`"index.js: 5.05 KB (5176 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 3.10 KB (3179 bytes)"`);
  });

  // A resolve hook registered before the import records every specifier the subpath's module graph asks for, and fails on
  // An ONNX Runtime one, so a notes entry that reached the network's code would fail here rather than in a consumer's worker
  test("#19 loads the notes subpath without ONNX Runtime", () => {
    expect.hasAssertions();

    const output = execFileSync(process.execPath, [
      "--input-type=module",
      "--eval",
      `const { registerHooks } = await import("node:module"); registerHooks({ resolve(specifier, context, nextResolve) { if (specifier.includes("onnxruntime")) throw new Error("loaded " + specifier); return nextResolve(specifier, context); } }); await import(${JSON.stringify(pathToFileURL(distNotesFile).href)}); console.log("loaded");`,
    ]);

    expect(output.toString().trim()).toBe("loaded");
  });

  // Under Node with no bundler, which sees only the named exports a CommonJS dependency's own analysis finds; the test
  // Runner's interop would hide a missing one
  test("loads under plain Node", () => {
    expect.hasAssertions();

    const output = execFileSync(process.execPath, [
      "--input-type=module",
      "--eval",
      `const { writeMidi } = await import(${JSON.stringify(pathToFileURL(distFile).href)}); console.log(String(writeMidi([]).length > 0));`,
    ]);

    expect(output.toString().trim()).toBe("true");
  });
});
