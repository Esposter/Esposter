import { createOsExecOptions } from "#src/services/exec/os/createOsExecOptions";
import { setupPlatformStub } from "#src/services/exec/test/setupPlatformStub.test";
import { NODE_MODULES_BIN_DIRECTORY } from "#src/services/exec/util/constants";
import { TEST_DIR } from "#src/services/exec/util/constants.test";
import { TEST_REPO_ROOT_WIN, TEST_WSL_LOGIN_ENVIRONMENT, TEST_WSL_PREFIX } from "#src/services/exec/wsl/constants.test";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { loginEnvironmentPath } = vi.hoisted(() => ({ loginEnvironmentPath: { value: "" } }));

vi.mock(import("#src/services/exec/store/createSharedPackageStoreOptions"), () => ({
  createSharedPackageStoreOptions: () => ({ bindDirectories: [], env: {} }),
}));

vi.mock(import("#src/services/exec/os/getOsCacheRoot"), () => ({ getOsCacheRoot: () => TEST_DIR }));

vi.mock(import("#src/services/exec/wsl/readWslPath"), () => ({
  readWslPath: (path: string) => `${TEST_WSL_PREFIX}${path}`,
}));

vi.mock(import("#src/services/exec/wsl/readWslLoginEnvironment"), () => ({
  readWslLoginEnvironment: () => ({ ...TEST_WSL_LOGIN_ENVIRONMENT, path: loginEnvironmentPath.value }),
}));

describe(createOsExecOptions, () => {
  // Inert store options (no fs writes) and the shared wsl mocks, so the injected PATH is composed from the same
  // `readWslPath` transform the sandbox's own chdir uses.
  const loginPath = TEST_WSL_LOGIN_ENVIRONMENT.path;

  const stubPlatform = setupPlatformStub();

  beforeEach(() => {
    loginEnvironmentPath.value = loginPath;
  });

  test("win32 leads the PATH with the repo bin at the logical path the overlay is mounted at", () => {
    expect.hasAssertions();

    stubPlatform("win32");
    // The regression this guards: naming the ext4 mirror instead. The mirror excludes node_modules by construction
    // (resolveMirrorExcludes), so that directory never exists and the PATH resolves the repo's binaries only when the
    // Launching shell happens to leak its own bin through interop. The logical path is where the overlay — deps lower
    // Included — is actually mounted, so it is the one spelling that holds node_modules while the command runs.
    expect(createOsExecOptions(TEST_REPO_ROOT_WIN, "pipe").env?.PATH).toBe(
      `${TEST_WSL_PREFIX}${TEST_REPO_ROOT_WIN}/${NODE_MODULES_BIN_DIRECTORY}:${loginPath}`,
    );
  });

  test("win32 fails loud on an empty login capture instead of running under the interop PATH's Windows shims", () => {
    expect.hasAssertions();

    stubPlatform("win32");
    // An empty capture on win32 is a *failed* capture (cold-WSL timeout / blocking rc), not "no WSL": the support
    // Probe already proved WSL is present. Proceeding would resolve `pnpm` to a /mnt/c Windows shim and die with a
    // Cryptic `node: not found` (127), so surface the timeout cause here rather than deep in the sandbox.
    loginEnvironmentPath.value = "";

    expect(() => createOsExecOptions(TEST_REPO_ROOT_WIN, "pipe")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: createOsExecOptions, WSL login-shell environment capture returned empty (likely a cold-WSL timeout or a blocking shell profile); start WSL with \`wsl.exe -- true\` and rerun — a warm distro captures immediately]`,
    );
  });

  test("injects no PATH off win32 — native Linux overlays at cwd, so its inherited PATH already resolves right", () => {
    expect.hasAssertions();

    stubPlatform("linux");

    expect(createOsExecOptions(TEST_REPO_ROOT_WIN, "pipe").env?.PATH).toBeUndefined();
  });
});
