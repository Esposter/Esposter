import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { PNPM_LOCKFILE_FILENAME } from "@/services/exec/util/constants";
import { resolveWorkspaceRoot } from "@/services/exec/util/resolveWorkspaceRoot";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

describe(resolveWorkspaceRoot, () => {
  const { cleanup, create, createWorkspace } = createTemporaryDirectoryTracker();

  afterEach(() => {
    cleanup();
  });

  test("resolves to the directory holding the lockfile when invoked at the root", () => {
    expect.hasAssertions();

    const root = createWorkspace();

    expect(resolveWorkspaceRoot(root)).toBe(root);
  });

  test("walks up from a subdirectory to the lockfile root", () => {
    expect.hasAssertions();

    const root = createWorkspace();
    const nested = join(root, "packages", "app");
    mkdirSync(nested, { recursive: true });

    expect(resolveWorkspaceRoot(nested)).toBe(root);
  });

  test("throws when no lockfile exists up the tree", () => {
    expect.hasAssertions();

    const root = create();

    expect(() => resolveWorkspaceRoot(root)).toThrow(PNPM_LOCKFILE_FILENAME);
  });
});
