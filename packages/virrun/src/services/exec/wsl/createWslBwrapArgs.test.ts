import { VIRRUN_SOURCES_DIRECTORY_NAME } from "#src/services/exec/wsl/constants";
import {
  TEST_PNPM_STORE_PATH_WIN,
  TEST_REPO_ROOT_WIN,
  TEST_WSL_CACHE_ROOT_LINUX,
  TEST_WSL_PREFIX,
} from "#src/services/exec/wsl/constants.test";
import { createWslBwrapArgs } from "#src/services/exec/wsl/createWslBwrapArgs";
import { describe, expect, test, vi } from "vitest";
// The ext4 mirror path createWslBwrapArgs uses for the --overlay-src source lower (fast reads). It stays at module
// Scope because the hoisted getWslSourceMirrorPath mock below returns it.
const TEST_WSL_MIRROR = `${TEST_WSL_CACHE_ROOT_LINUX}/${VIRRUN_SOURCES_DIRECTORY_NAME}`;

vi.mock(import("#src/services/exec/wsl/readWslPath"), () => ({
  readWslPath: (path: string) => `${TEST_WSL_PREFIX}${path}`,
}));

vi.mock(import("#src/services/exec/wsl/getWslSourceMirrorPath"), () => ({
  getWslSourceMirrorPath: () => TEST_WSL_MIRROR,
}));

describe(createWslBwrapArgs, () => {
  // The logical /mnt/c path createWslBwrapArgs mounts and chdir's into so pwd matches native. The assertions prove
  // The two are decoupled: content comes from the mirror, but the mountpoint is the wslpath-translated repo path.
  const TEST_WSL_LOGICAL = `${TEST_WSL_PREFIX}${TEST_REPO_ROOT_WIN}`;

  test("sources reads from the ext4 mirror but mounts and chdirs at the logical repo path", () => {
    expect.hasAssertions();

    const wslBindDirectory = `${TEST_WSL_PREFIX}${TEST_PNPM_STORE_PATH_WIN}`;
    const args = createWslBwrapArgs("pwd", TEST_REPO_ROOT_WIN, { bindDirs: [TEST_PNPM_STORE_PATH_WIN] });

    expect(args).toStrictEqual([
      "--unshare-all",
      "--die-with-parent",
      "--ro-bind",
      "/",
      "/",
      "--dev",
      "/dev",
      "--proc",
      "/proc",
      "--tmpfs",
      "/tmp",
      "--overlay-src",
      TEST_WSL_MIRROR,
      "--tmp-overlay",
      TEST_WSL_LOGICAL,
      "--bind",
      wslBindDirectory,
      wslBindDirectory,
      "--chdir",
      TEST_WSL_LOGICAL,
      "--",
      "/bin/sh",
      "-c",
      "pwd",
    ]);
  });

  test("translates capture overlay upper and work dirs before building the argv", () => {
    expect.hasAssertions();

    const upperDir = String.raw`C:\cache\snap\upper`;
    const workDir = String.raw`C:\cache\snap\work`;
    const args = createWslBwrapArgs("pnpm install", TEST_REPO_ROOT_WIN, { overlayLayers: { upperDir, workDir } });

    expect(args).toMatchInlineSnapshot(`
      [
        "--unshare-all",
        "--die-with-parent",
        "--ro-bind",
        "/",
        "/",
        "--dev",
        "/dev",
        "--proc",
        "/proc",
        "--tmpfs",
        "/tmp",
        "--overlay-src",
        "/a/.virrun/sources",
        "--overlay",
        "/wsl/C:\\cache\\snap\\upper",
        "/wsl/C:\\cache\\snap\\work",
        "/wsl/C:\\a",
        "--chdir",
        "/wsl/C:\\a",
        "--",
        "/bin/sh",
        "-c",
        "pnpm install",
      ]
    `);
  });

  test("translates fork overlay lower dirs before building the argv", () => {
    expect.hasAssertions();

    const snapshotUpper = String.raw`C:\cache\snap\upper`;
    const args = createWslBwrapArgs("vitest", TEST_REPO_ROOT_WIN, { overlayLayers: { lowerDirs: [snapshotUpper] } });

    expect(args).toMatchInlineSnapshot(`
      [
        "--unshare-all",
        "--die-with-parent",
        "--ro-bind",
        "/",
        "/",
        "--dev",
        "/dev",
        "--proc",
        "/proc",
        "--tmpfs",
        "/tmp",
        "--overlay-src",
        "/a/.virrun/sources",
        "--overlay-src",
        "/wsl/C:\\cache\\snap\\upper",
        "--tmp-overlay",
        "/wsl/C:\\a",
        "--chdir",
        "/wsl/C:\\a",
        "--",
        "/bin/sh",
        "-c",
        "vitest",
      ]
    `);
  });
});
