import { getFileSize } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const distFile = resolve(import.meta.dirname, "../dist/index.js");
const distDtsFile = resolve(import.meta.dirname, "../dist/index.d.ts");

describe("vue-phaserjs", () => {
  // The only package whose bundle differs across OSes: it is large enough that the minifier's single-character
  // Identifiers run out, and which module gets the two-character name follows a module order that a Windows and
  // A POSIX build resolve differently — two bytes apart, every time. The types bundle is byte-identical, so it
  // Stays unguarded
  test.skipIf(process.platform !== "win32")("bundle size (Windows)", () => {
    expect.hasAssertions();
    expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 32.39 KB (33164 bytes)"`);
  });

  test.skipIf(process.platform === "win32")("bundle size (POSIX)", () => {
    expect.hasAssertions();
    expect(getFileSize(distFile)).toMatchInlineSnapshot(`"index.js: 32.39 KB (33164 bytes)"`);
  });

  test("types size", () => {
    expect.hasAssertions();
    expect(getFileSize(distDtsFile)).toMatchInlineSnapshot(`"index.d.ts: 10.70 KB (10961 bytes)"`);
  });
});
