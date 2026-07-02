import { VIRRUN_SOURCES_DIRECTORY_NAME } from "@/services/exec/wsl/constants";
import {
  TEST_PNPM_STORE_PATH_WIN,
  TEST_REPO_ROOT_WIN,
  TEST_WSL_CACHE_ROOT_LINUX,
  TEST_WSL_PREFIX,
} from "@/services/exec/wsl/constants.test";
import { createWslBwrapArgs } from "@/services/exec/wsl/createWslBwrapArgs";
import { describe, expect, test, vi } from "vitest";
// The ext4 mirror path createWslBwrapArgs uses for the --overlay-src source lower (fast reads), and the logical
// /mnt/c path it mounts/chdir's into so pwd matches native. The assertions prove the two are decoupled: content comes
// From the mirror, but the mountpoint is the wslpath-translated repo path.
const TEST_WSL_MIRROR = `${TEST_WSL_CACHE_ROOT_LINUX}/${VIRRUN_SOURCES_DIRECTORY_NAME}`;
const TEST_WSL_LOGICAL = `${TEST_WSL_PREFIX}${TEST_REPO_ROOT_WIN}`;

vi.mock(import("@/services/exec/wsl/readWslPath"), () => ({
  readWslPath: (path: string) => `${TEST_WSL_PREFIX}${path}`,
}));

vi.mock(import("@/services/exec/wsl/ensureWslSourceMirror"), () => ({
  ensureWslSourceMirror: () => TEST_WSL_MIRROR,
}));

describe(createWslBwrapArgs, () => {
  test("sources reads from the ext4 mirror but mounts and chdirs at the logical repo path", () => {
    expect.hasAssertions();

    const wslBindDir = `${TEST_WSL_PREFIX}${TEST_PNPM_STORE_PATH_WIN}`;
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
      wslBindDir,
      wslBindDir,
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

    expect(args).toStrictEqual(
      expect.arrayContaining([
        "--overlay",
        `${TEST_WSL_PREFIX}${upperDir}`,
        `${TEST_WSL_PREFIX}${workDir}`,
        TEST_WSL_LOGICAL,
      ]),
    );
    expect(args).not.toContain("--tmp-overlay");
  });

  test("translates fork overlay lower dirs before building the argv", () => {
    expect.hasAssertions();

    const snapshotUpper = String.raw`C:\cache\snap\upper`;
    const args = createWslBwrapArgs("vitest", TEST_REPO_ROOT_WIN, { overlayLayers: { lowerDirs: [snapshotUpper] } });

    expect(args).toStrictEqual(
      expect.arrayContaining(["--overlay-src", `${TEST_WSL_PREFIX}${snapshotUpper}`, "--tmp-overlay"]),
    );
  });
});
