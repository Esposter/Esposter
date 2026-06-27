import {
  VIRRUN_CACHE_DIRECTORY_NAME,
  VIRRUN_PNPM_STORE_DIRECTORY_NAME,
  VIRRUN_STORE_DIRECTORY_NAME,
} from "@/services/exec/constants";
import { createWslBwrapArgs } from "@/services/exec/createWslBwrapArgs";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/exec/readWslPath"), () => ({
  readWslPath: (path: string) => `/wsl/${path}`,
}));

describe(createWslBwrapArgs, () => {
  test("translates cwd and bind dirs before building the bubblewrap argv", () => {
    expect.hasAssertions();

    const cwd = String.raw`C:\repo`;
    const wslCwd = `/wsl/${cwd}`;
    const bindDir = [
      cwd,
      VIRRUN_CACHE_DIRECTORY_NAME,
      VIRRUN_STORE_DIRECTORY_NAME,
      VIRRUN_PNPM_STORE_DIRECTORY_NAME,
    ].join("\\");
    const wslBindDir = `/wsl/${bindDir}`;
    const args = createWslBwrapArgs("pwd", cwd, { bindDirs: [bindDir] });

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
});
