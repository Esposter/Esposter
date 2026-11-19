import { clearOwnedFolder } from "#src/services/shared/clearOwnedFolder";
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

// A fixture is written raw: the writers' own JSON writer formats each file through the repository's formatter, which a
// Clearing test does not need and which is slow under a loaded machine
const writeFixture = (path: string): void => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, "{}");
};

describe(clearOwnedFolder, () => {
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "clear-owned-folder-"));
  });

  afterEach(() => {
    rmSync(root, { force: true, recursive: true });
  });

  test("re-extracting leaves no stale file", async () => {
    expect.hasAssertions();

    const folder = join(root, "interface");
    writeFixture(join(folder, "stale.json"));

    await clearOwnedFolder(folder);
    writeFixture(join(folder, "interface.json"));

    expect(readdirSync(folder)).toStrictEqual(["interface.json"]);
  });

  test("a writer clears only the folder it owns", async () => {
    expect.hasAssertions();

    const folder = join(root, "interface");
    writeFixture(join(folder, "stale.json"));
    writeFixture(join(root, "clips", "clip.json"));

    await clearOwnedFolder(folder);

    expect(readdirSync(join(root, "clips"))).toStrictEqual(["clip.json"]);
  });
});
