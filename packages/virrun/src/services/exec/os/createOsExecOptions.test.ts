import { createOsExecOptions } from "#src/services/exec/os/createOsExecOptions";
import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import { COREPACK_HOME_KEY, NODE_MODULES_BIN_DIRECTORY } from "#src/services/exec/util/constants";
import {
  TEST_REPO_ROOT_WIN,
  TEST_WSL_CACHE_ROOT_LINUX,
  TEST_WSL_LOGIN_ENVIRONMENT,
  TEST_WSL_PREFIX,
} from "#src/services/exec/wsl/constants.test";
import { createTestWslUnc } from "#src/services/exec/wsl/createTestWslUnc.test";
import { getWslSourceMirrorPath } from "#src/services/exec/wsl/getWslSourceMirrorPath";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { loginEnvironmentPath, osCacheRoot } = vi.hoisted(() => ({
  loginEnvironmentPath: { value: "" },
  osCacheRoot: { value: "" },
}));

vi.mock(import("#src/services/exec/store/createSharedPackageStoreOptions"), () => ({
  createSharedPackageStoreOptions: () => ({ bindDirs: [], env: {} }),
}));

vi.mock(import("#src/services/exec/os/getOsCacheRoot"), () => ({ getOsCacheRoot: () => osCacheRoot.value }));
vi.mock(import("#src/services/exec/wsl/getWslNativeCacheRoot"), () => ({
  getWslNativeCacheRoot: () => createTestWslUnc(TEST_WSL_CACHE_ROOT_LINUX),
}));

vi.mock(import("#src/services/exec/wsl/readWslPath"), () => ({
  readWslPath: (path: string) => `${TEST_WSL_PREFIX}${path}`,
}));

vi.mock(import("#src/services/exec/wsl/readWslLoginEnvironment"), () => ({
  readWslLoginEnvironment: () => ({
    nodeVersion: TEST_WSL_LOGIN_ENVIRONMENT.nodeVersion,
    path: loginEnvironmentPath.value,
  }),
}));

// `process.platform` is a read-only own property rather than a global binding, so `vi.stubGlobal` cannot reach it
// Without replacing the whole `process` object; the suite's afterEach puts the real one back
const stubWin32Platform = () => {
  Object.defineProperty(process, "platform", { configurable: true, value: "win32" });
};

describe(createOsExecOptions, () => {
  // Inert store options (no fs writes) and the shared wsl mocks so getWslSourceMirrorPath resolves a canonical mirror
  // Path from TEST_REPO_ROOT_WIN — the same transform createWslSourceMirrorSync.test / sourceMirrorPaths.test use. The
  // Cache root is a real temp dir per test, since the corepack home under it is materialized, not merely named.
  const loginPath = TEST_WSL_LOGIN_ENVIRONMENT.path;

  const { cleanup, create } = createTemporaryDirectoryTracker();
  const { platform } = process;

  beforeEach(() => {
    osCacheRoot.value = create();
    loginEnvironmentPath.value = loginPath;
  });

  afterEach(() => {
    Object.defineProperty(process, "platform", { configurable: true, value: platform });
    cleanup();
  });

  test("win32 prepends the mirror's node_modules/.bin ahead of the leaked host bin so the overlaid binary wins", () => {
    expect.hasAssertions();

    stubWin32Platform();
    // The regression this guards: without the prepend, a bare command resolves the /mnt/c host bin (win32 build)
    // Baked into the WSL login PATH and crashes needing its -linux-x64 sibling. The mirror bin must come first.
    const mirror = getWslSourceMirrorPath(TEST_REPO_ROOT_WIN);

    expect(createOsExecOptions(TEST_REPO_ROOT_WIN, "pipe").env?.PATH).toBe(
      `${mirror}/${NODE_MODULES_BIN_DIRECTORY}:${loginPath}`,
    );
  });

  test("win32 fails loud on an empty login capture instead of running under the interop PATH's broken corepack shim", () => {
    expect.hasAssertions();

    stubWin32Platform();
    // An empty capture on win32 is a *failed* capture (cold-WSL timeout / blocking rc), not "no WSL": the support
    // Probe already proved WSL is present. Proceeding would resolve `corepack` to the /mnt/c fnm shim and die with a
    // Cryptic `node: not found` (127), so surface the timeout cause here rather than deep in the sandbox.
    loginEnvironmentPath.value = "";

    expect(() => createOsExecOptions(TEST_REPO_ROOT_WIN, "pipe")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: createOsExecOptions, WSL login-shell environment capture returned empty (likely a cold-WSL timeout or a blocking shell profile); start WSL with \`wsl.exe -- true\` and rerun — a warm distro captures immediately]`,
    );
  });

  test("injects no PATH off win32 — native Linux overlays at cwd, so its inherited PATH already resolves right", () => {
    expect.hasAssertions();

    Object.defineProperty(process, "platform", { configurable: true, value: "linux" });

    expect(createOsExecOptions(TEST_REPO_ROOT_WIN, "pipe").env?.PATH).toBeUndefined();
  });

  test("points every run's corepack home at a writable bound dir, not the read-only sandbox home", () => {
    expect.hasAssertions();

    // The regression this guards: the sandbox mounts `/` read-only, so a command that shells out to `pnpm` runs the
    // Node manager's corepack shim, which downloads the repo's pinned packageManager under $HOME/.cache and dies
    // EROFS. Only the capture install carried a corepack home, so every ordinary run hit it.
    const { bindDirs, env } = createOsExecOptions(TEST_REPO_ROOT_WIN, "pipe");
    const corepackHome = env?.[COREPACK_HOME_KEY] ?? "";

    expect(corepackHome.startsWith(osCacheRoot.value)).toBe(true);
    expect(bindDirs).toContain(corepackHome);
  });
});
