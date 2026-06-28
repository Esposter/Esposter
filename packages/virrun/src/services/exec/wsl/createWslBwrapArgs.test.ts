import { TEST_PNPM_STORE_PATH_WIN, TEST_REPO_ROOT_WIN, TEST_WSL_PREFIX } from "@/services/exec/wsl/constants.test";
import { createWslBwrapArgs } from "@/services/exec/wsl/createWslBwrapArgs";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/exec/wsl/readWslPath"), () => ({
  readWslPath: (path: string) => `${TEST_WSL_PREFIX}${path}`,
}));

describe(createWslBwrapArgs, () => {
  test("translates cwd and bind dirs before building the bubblewrap argv", () => {
    expect.hasAssertions();

    const wslCwd = `${TEST_WSL_PREFIX}${TEST_REPO_ROOT_WIN}`;
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
      wslCwd,
      "--tmp-overlay",
      wslCwd,
      "--bind",
      wslBindDir,
      wslBindDir,
      "--chdir",
      wslCwd,
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
        `${TEST_WSL_PREFIX}${TEST_REPO_ROOT_WIN}`,
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
