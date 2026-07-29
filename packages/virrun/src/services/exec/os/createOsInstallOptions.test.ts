import { createOsInstallOptions } from "@/services/exec/os/createOsInstallOptions";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { CI_ENV_KEY, CI_ENV_VALUE, COREPACK_HOME_KEY } from "@/services/exec/util/constants";
import { TEST_REPO_ROOT_WIN } from "@/services/exec/wsl/constants.test";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
// Only the install-specific delta is asserted here; the shared sandbox options (PATH, corepack home, store binds) are
// CreateOsExecOptions' contract and are covered by its own suite.
const { osCacheRoot } = vi.hoisted(() => ({ osCacheRoot: { value: "" } }));

vi.mock(import("@/services/exec/store/createSharedPackageStoreOptions"), () => ({
  createSharedPackageStoreOptions: () => ({ bindDirs: [], env: {} }),
}));

vi.mock(import("@/services/exec/os/getOsCacheRoot"), () => ({ getOsCacheRoot: () => osCacheRoot.value }));

describe(createOsInstallOptions, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();

  beforeEach(() => {
    osCacheRoot.value = create();
  });

  afterEach(cleanup);

  test("adds CI so pnpm purges the leaked host node_modules instead of prompting for a TTY", () => {
    expect.hasAssertions();

    expect(createOsInstallOptions(TEST_REPO_ROOT_WIN, "pipe").env?.[CI_ENV_KEY]).toBe(CI_ENV_VALUE);
  });

  test("keeps the sandbox options it extends, so the install bootstraps corepack into the same bound home", () => {
    expect.hasAssertions();

    const { bindDirs, env } = createOsInstallOptions(TEST_REPO_ROOT_WIN, "pipe");
    const corepackHome = env?.[COREPACK_HOME_KEY] ?? "";

    expect(corepackHome.startsWith(osCacheRoot.value)).toBe(true);
    expect(bindDirs).toContain(corepackHome);
  });
});
