import { createWslBwrapArgs } from "@/services/exec/createWslBwrapArgs";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/exec/readWslPath"), () => ({
  readWslPath: (path: string) => `/wsl/${path}`,
}));

describe(createWslBwrapArgs, () => {
  test("translates cwd and bind dirs before building the bubblewrap argv", () => {
    expect.hasAssertions();

    const args = createWslBwrapArgs("pwd", "C:\\repo", { bindDirs: ["C:\\repo\\.virrun\\store\\pnpm"] });

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
      "/wsl/C:\\repo",
      "--tmp-overlay",
      "/wsl/C:\\repo",
      "--bind",
      "/wsl/C:\\repo\\.virrun\\store\\pnpm",
      "/wsl/C:\\repo\\.virrun\\store\\pnpm",
      "--chdir",
      "/wsl/C:\\repo",
      "--",
      "/bin/sh",
      "-c",
      "pwd",
    ]);
  });
});
