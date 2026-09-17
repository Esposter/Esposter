import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import { seedFile } from "#src/services/exec/test/seedFile.test";
import { checkHasSandboxNode } from "#src/services/exec/wsl/checkHasSandboxNode";
import { NODE_EXECUTABLE } from "#src/services/exec/wsl/constants";
import { join } from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";

// The UNC translation is the win32 host's view of the distro; the directories here are the test host's own, so the
// Mapping is the identity and the subject is reduced to the question it exists to answer.
vi.mock(import("#src/services/exec/wsl/getWslUncPath"), () => ({ getWslUncPath: (path: string) => path }));

describe(checkHasSandboxNode, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();

  afterEach(() => {
    cleanup();
  });

  test("answers for the executable, not the directory holding it", () => {
    expect.hasAssertions();

    // A node manager that removed a version can leave the directory behind, and a capture whose PATH cannot resolve
    // `node` is exactly as unusable as one pointing nowhere.
    const install = create();

    expect(checkHasSandboxNode(install)).toBe(false);

    seedFile(join(install, NODE_EXECUTABLE));

    expect(checkHasSandboxNode(install)).toBe(true);
  });

  test("answers false for an install directory that is gone", () => {
    expect.hasAssertions();

    const removedInstall = create();
    cleanup();

    expect(checkHasSandboxNode(removedInstall)).toBe(false);
  });
});
