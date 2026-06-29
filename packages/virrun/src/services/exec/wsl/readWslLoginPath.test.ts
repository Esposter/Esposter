import type { execFileSync as baseExecFileSync } from "node:child_process";

import { takeOne } from "@esposter/shared";
import { beforeEach, describe, expect, test, vi } from "vitest";
// The implementation brackets the captured PATH with these private markers; mirror them here so the mocked
// Capture output is shaped like the real interactive-login-shell output the parser slices between.
const PATH_BEGIN = "__VIRRUN_LOGIN_PATH_BEGIN__";
const PATH_END = "__VIRRUN_LOGIN_PATH_END__";

const { execFileSync } = vi.hoisted(() => ({ execFileSync: vi.fn<typeof baseExecFileSync>() }));

vi.mock(import("node:child_process"), () => ({ execFileSync: execFileSync as unknown as typeof baseExecFileSync }));

describe("readWslLoginPath", () => {
  beforeEach(() => {
    // Reset the module so its memoized PATH does not leak between cases, and seed the default capture output.
    vi.resetModules();
    execFileSync.mockReset();
    execFileSync.mockReturnValue(`noise\n${PATH_BEGIN}/usr/local/bin:/usr/bin${PATH_END}`);
  });

  test("extracts the PATH between the markers and memoizes it", async () => {
    expect.hasAssertions();

    const { readWslLoginPath } = await import("@/services/exec/wsl/readWslLoginPath");

    expect(readWslLoginPath()).toBe("/usr/local/bin:/usr/bin");
    expect(readWslLoginPath()).toBe("/usr/local/bin:/usr/bin");
    expect(execFileSync).toHaveBeenCalledTimes(1);
  });

  test("captures through the user's interactive login shell", async () => {
    expect.hasAssertions();

    const { readWslLoginPath } = await import("@/services/exec/wsl/readWslLoginPath");

    readWslLoginPath();
    const { calls } = execFileSync.mock;
    const [file, args] = takeOne(calls, calls.length - 1);
    const script = takeOne(args ?? [], 3);

    expect(file).toBe("wsl.exe");
    expect([takeOne(args ?? [], 0), takeOne(args ?? [], 1), takeOne(args ?? [], 2)]).toStrictEqual([
      "--exec",
      "sh",
      "-c",
    ]);
    expect(script).toContain("-lic");
    expect(script).toContain("getent passwd");
  });

  test("degrades to an empty PATH when the marked output is absent", async () => {
    expect.hasAssertions();

    execFileSync.mockReturnValue("");
    const { readWslLoginPath } = await import("@/services/exec/wsl/readWslLoginPath");

    expect(readWslLoginPath()).toBe("");
  });

  test("degrades to an empty PATH when WSL is unavailable", async () => {
    expect.hasAssertions();

    execFileSync.mockImplementation(() => {
      throw new Error("wsl.exe not found");
    });
    const { readWslLoginPath } = await import("@/services/exec/wsl/readWslLoginPath");

    expect(readWslLoginPath()).toBe("");
  });
});
