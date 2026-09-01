import { getSourceFingerprint } from "#src/getSourceFingerprint";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

// The fingerprint reads `src` relative to the package tsdown is building, which is its cwd, so the subject here
// Is a throwaway package rather than this one's own source.
describe(getSourceFingerprint, () => {
  const SOURCE_FILE = "constants.ts";
  const GENERATED_BARREL_PATHS = ["src/index.ts"];
  const originalDirectory = process.cwd();
  let packageDirectory = "";

  beforeEach(() => {
    packageDirectory = mkdtempSync(join(tmpdir(), "source-fingerprint-"));
    mkdirSync(join(packageDirectory, "src"));
    process.chdir(packageDirectory);
  });

  afterEach(() => {
    process.chdir(originalDirectory);
    rmSync(packageDirectory, { force: true, recursive: true });
  });

  test("changes when a file gains its first export", () => {
    expect.hasAssertions();
    const sourceFile = resolve(packageDirectory, "src", SOURCE_FILE);
    writeFileSync(sourceFile, 'const NAME = "";\n');
    const fingerprint = getSourceFingerprint(GENERATED_BARREL_PATHS, []);
    // Ctix leaves an export-less file out of the barrel, so this is the edit that adds a line to it without
    // Adding a file — the transition a path-only fingerprint reports as no change at all.
    writeFileSync(sourceFile, 'export const NAME = "";\n');

    expect(getSourceFingerprint(GENERATED_BARREL_PATHS, [])).not.toBe(fingerprint);
  });

  test("does not change when an exporting file's contents change", () => {
    expect.hasAssertions();
    const sourceFile = resolve(packageDirectory, "src", SOURCE_FILE);
    writeFileSync(sourceFile, 'export const NAME = "";\n');
    const fingerprint = getSourceFingerprint(GENERATED_BARREL_PATHS, []);
    // The property that makes the guard worth having: a barrel of `export * from` lines cannot depend on what a
    // File exports, so the generation is skipped for every edit that keeps the file exporting.
    writeFileSync(sourceFile, 'export const NAME = "renamed";\nexport const OTHER = 1;\n');

    expect(getSourceFingerprint(GENERATED_BARREL_PATHS, [])).toBe(fingerprint);
  });

  test("changes when a directory barrel is added", () => {
    expect.hasAssertions();
    writeFileSync(resolve(packageDirectory, "src", SOURCE_FILE), 'export const NAME = "";\n');
    const fingerprint = getSourceFingerprint(GENERATED_BARREL_PATHS, []);
    // A nested `index.ts` is hand-written source that the root barrel carries its own line for, so it counts as
    // A file appearing. Excluded by shape instead, this is the edit that adds an export the barrel never gains
    // And the build never reports.
    mkdirSync(resolve(packageDirectory, "src", "store"));
    writeFileSync(resolve(packageDirectory, "src", "store", "index.ts"), 'export const OTHER = "";\n');

    expect(getSourceFingerprint(GENERATED_BARREL_PATHS, [])).not.toBe(fingerprint);
  });

  test("does not change when the generated barrel is written", () => {
    expect.hasAssertions();
    writeFileSync(resolve(packageDirectory, "src", SOURCE_FILE), 'export const NAME = "";\n');
    const fingerprint = getSourceFingerprint(GENERATED_BARREL_PATHS, []);
    // Ctix's own output is not an input to what ctix would write, so the first build after a fresh checkout does
    // Not invalidate the fingerprint it just recorded.
    writeFileSync(resolve(packageDirectory, "src", "index.ts"), 'export * from "./constants";\n');

    expect(getSourceFingerprint(GENERATED_BARREL_PATHS, [])).toBe(fingerprint);
  });

  test("changes when a generator input changes", () => {
    expect.hasAssertions();
    const generatorFile = resolve(packageDirectory, "ctix.json");
    writeFileSync(resolve(packageDirectory, "src", SOURCE_FILE), 'export const NAME = "";\n');
    writeFileSync(generatorFile, '{ "mode": "bundle" }\n');
    const fingerprint = getSourceFingerprint(GENERATED_BARREL_PATHS, [generatorFile]);
    writeFileSync(generatorFile, '{ "mode": "module" }\n');

    expect(getSourceFingerprint(GENERATED_BARREL_PATHS, [generatorFile])).not.toBe(fingerprint);
  });
});
