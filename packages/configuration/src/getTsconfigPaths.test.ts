import { getTsconfigPaths } from "#src/getTsconfigPaths";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

// Whatever this returns is hashed into the barrel guard, so an empty result is not a visible failure — it is the
// Guard quietly going back to skipping a regeneration it owes. That is what these assert.
describe(getTsconfigPaths, () => {
  let firstDirectory = "";
  let secondDirectory = "";

  beforeEach(() => {
    firstDirectory = mkdtempSync(join(tmpdir(), "tsconfig-paths-"));
    secondDirectory = mkdtempSync(join(tmpdir(), "tsconfig-paths-"));
  });

  afterEach(() => {
    for (const directory of [firstDirectory, secondDirectory]) rmSync(directory, { force: true, recursive: true });
  });

  test("finds every tsconfig across the directories, sorted and deduplicated", () => {
    expect.hasAssertions();
    // The real shape: a package holds `tsconfig.json` and `tsconfig.build.json`, and the preset directory holds
    // The base every one of them extends.
    writeFileSync(resolve(firstDirectory, "tsconfig.json"), "{}\n");
    writeFileSync(resolve(firstDirectory, "tsconfig.build.json"), "{}\n");
    writeFileSync(resolve(secondDirectory, "tsconfig.base.json"), "{}\n");

    expect(getTsconfigPaths(firstDirectory, secondDirectory, firstDirectory)).toStrictEqual(
      [
        resolve(firstDirectory, "tsconfig.build.json"),
        resolve(firstDirectory, "tsconfig.json"),
        resolve(secondDirectory, "tsconfig.base.json"),
      ].toSorted(),
    );
  });

  test("ignores what is not a tsconfig", () => {
    expect.hasAssertions();
    // `tsconfig.tsbuildinfo` sits beside the presets and changes on every build, so matching it would invalidate
    // The guard on every build it was meant to skip.
    writeFileSync(resolve(firstDirectory, "tsconfig.tsbuildinfo"), "{}\n");
    writeFileSync(resolve(firstDirectory, "package.json"), "{}\n");

    expect(getTsconfigPaths(firstDirectory)).toStrictEqual([]);
  });
});
