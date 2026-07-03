import { createOsExecOptions } from "@/services/exec/os/createOsExecOptions";
import { NODE_MODULES_BIN_DIRECTORY } from "@/services/exec/util/constants";
import { TEST_REPO_ROOT_WIN, TEST_WSL_CACHE_ROOT_LINUX, TEST_WSL_PREFIX } from "@/services/exec/wsl/constants.test";
import { createTestWslUnc } from "@/services/exec/wsl/createTestWslUnc.test";
import { getWslSourceMirrorPath } from "@/services/exec/wsl/getWslSourceMirrorPath";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
// Inert store options (no fs writes) and the shared wsl mocks so getWslSourceMirrorPath resolves a canonical mirror
// Path from TEST_REPO_ROOT_WIN — the same transform ensureWslSourceMirror.test / getWslSourceMirrorPath.test use.
const loginPath = "/usr/local/bin:/usr/bin";

vi.mock(import("@/services/exec/store/createSharedPackageStoreOptions"), () => ({
  createSharedPackageStoreOptions: () => ({ bindDirs: [], env: {} }),
}));

vi.mock(import("@/services/exec/os/getOsCacheRoot"), () => ({ getOsCacheRoot: () => "" }));
vi.mock(import("@/services/exec/wsl/getWslNativeCacheRoot"), () => ({
  getWslNativeCacheRoot: () => createTestWslUnc(TEST_WSL_CACHE_ROOT_LINUX),
}));

vi.mock(import("@/services/exec/wsl/readWslPath"), () => ({
  readWslPath: (path: string) => `${TEST_WSL_PREFIX}${path}`,
}));

vi.mock(import("@/services/exec/wsl/readWslLoginPath"), () => ({ readWslLoginPath: () => loginPath }));

describe(createOsExecOptions, () => {
  const { platform } = process;

  afterEach(() => {
    Object.defineProperty(process, "platform", { configurable: true, value: platform });
  });

  describe("win32", () => {
    beforeEach(() => {
      Object.defineProperty(process, "platform", { configurable: true, value: "win32" });
    });

    test("prepends the mirror's node_modules/.bin ahead of the leaked host bin so the overlaid binary wins", () => {
      expect.hasAssertions();

      // The regression this guards: without the prepend, a bare command resolves the /mnt/c host bin (win32 build)
      // Baked into the WSL login PATH and crashes needing its -linux-x64 sibling. The mirror bin must come first.
      const mirror = getWslSourceMirrorPath(TEST_REPO_ROOT_WIN);

      expect(createOsExecOptions(TEST_REPO_ROOT_WIN, "pipe").env?.PATH).toBe(
        `${mirror}/${NODE_MODULES_BIN_DIRECTORY}:${loginPath}`,
      );
    });
  });

  test("injects no PATH off win32 — native Linux overlays at cwd, so its inherited PATH already resolves right", () => {
    expect.hasAssertions();

    Object.defineProperty(process, "platform", { configurable: true, value: "linux" });

    expect(createOsExecOptions(TEST_REPO_ROOT_WIN, "pipe").env?.PATH).toBeUndefined();
  });
});
