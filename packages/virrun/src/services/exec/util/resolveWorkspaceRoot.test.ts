import { createTemporaryDirectory } from "@/services/exec/test/createTemporaryDirectory.test";
import { createWorkspaceDir } from "@/services/exec/test/createWorkspaceDir.test";
import { PNPM_LOCKFILE_FILENAME } from "@/services/exec/util/constants";
import { resolveWorkspaceRoot } from "@/services/exec/util/resolveWorkspaceRoot";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

describe(resolveWorkspaceRoot, () => {
  let root = "";

  afterEach(() => {
    if (root) rmSync(root, { force: true, recursive: true });
    root = "";
  });

  test("resolves to the directory holding the lockfile when invoked at the root", () => {
    expect.hasAssertions();

    root = createWorkspaceDir();

    expect(resolveWorkspaceRoot(root)).toBe(root);
  });

  test("walks up from a subdirectory to the lockfile root", () => {
    expect.hasAssertions();

    root = createWorkspaceDir();
    const nested = join(root, "packages", "app");
    mkdirSync(nested, { recursive: true });

    expect(resolveWorkspaceRoot(nested)).toBe(root);
  });

  test("throws when no lockfile exists up the tree", () => {
    expect.hasAssertions();

    root = createTemporaryDirectory();

    expect(() => resolveWorkspaceRoot(root)).toThrow(PNPM_LOCKFILE_FILENAME);
  });
});
