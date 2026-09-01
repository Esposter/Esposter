import { getSourceFingerprint } from "#src/getSourceFingerprint";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

// The fingerprint reads `src` relative to the package tsdown is building, which is its cwd, so the subject here
// Is a throwaway package rather than this one's own source.
describe(getSourceFingerprint, () => {
  const SOURCE_FILE = "constants.ts";
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
    const fingerprint = getSourceFingerprint([]);
    // Ctix leaves an export-less file out of the barrel, so this is the edit that adds a line to it without
    // Adding a file — the transition a path-only fingerprint reports as no change at all.
    writeFileSync(sourceFile, 'export const NAME = "";\n');

    expect(getSourceFingerprint([])).not.toBe(fingerprint);
  });

  test("does not change when an exporting file's contents change", () => {
    expect.hasAssertions();
    const sourceFile = resolve(packageDirectory, "src", SOURCE_FILE);
    writeFileSync(sourceFile, 'export const NAME = "";\n');
    const fingerprint = getSourceFingerprint([]);
    // The property that makes the guard worth having: a barrel of `export * from` lines cannot depend on what a
    // File exports, so the generation is skipped for every edit that keeps the file exporting.
    writeFileSync(sourceFile, 'export const NAME = "renamed";\nexport const OTHER = 1;\n');

    expect(getSourceFingerprint([])).toBe(fingerprint);
  });

  test("changes when a generator input changes", () => {
    expect.hasAssertions();
    const generatorFile = resolve(packageDirectory, "ctix.json");
    writeFileSync(resolve(packageDirectory, "src", SOURCE_FILE), 'export const NAME = "";\n');
    writeFileSync(generatorFile, '{ "mode": "bundle" }\n');
    const fingerprint = getSourceFingerprint([generatorFile]);
    writeFileSync(generatorFile, '{ "mode": "module" }\n');

    expect(getSourceFingerprint([generatorFile])).not.toBe(fingerprint);
  });
});
