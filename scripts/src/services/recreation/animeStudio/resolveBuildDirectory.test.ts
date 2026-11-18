import { resolveBuildDirectory } from "#src/services/recreation/animeStudio/resolveBuildDirectory";
import { mkdir, mkdtemp, realpath, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

describe(resolveBuildDirectory, () => {
  let root = "";
  let realDirectory = "";

  beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), "build-directory-"));
    await mkdir(join(root, "real"));
    await symlink(join(root, "real"), join(root, "link"));
    realDirectory = await realpath(join(root, "real"));
  });

  afterAll(async () => {
    await rm(root, { force: true, recursive: true });
  });

  test("names a directory reached through a symlink by its real path, creating it first", () => {
    expect.hasAssertions();

    expect(resolveBuildDirectory(join(root, "link", "tools"))).toBe(join(realDirectory, "tools"));
  });
});
