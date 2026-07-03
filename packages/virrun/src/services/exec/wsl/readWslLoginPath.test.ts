import type { execFileSync as baseExecFileSync } from "node:child_process";

import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { VIRRUN_CACHE_HOME_KEY, WSL_LOGIN_PATH_CACHE_FILENAME } from "@/services/exec/util/constants";
import { getHostFingerprint } from "@/services/exec/util/getHostFingerprint";
import { writeWslEnvironmentCache } from "@/services/exec/wsl/writeWslEnvironmentCache";
import { takeOne } from "@esposter/shared";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
// The implementation brackets the captured PATH with these private markers; mirror them here so the mocked
// Capture output is shaped like the real interactive-login-shell output the parser slices between.
const PATH_BEGIN = "__VIRRUN_LOGIN_PATH_BEGIN__";
const PATH_END = "__VIRRUN_LOGIN_PATH_END__";

const { execFileSync } = vi.hoisted(() => ({ execFileSync: vi.fn<typeof baseExecFileSync>() }));

vi.mock(import("node:child_process"), () => ({ execFileSync: execFileSync as unknown as typeof baseExecFileSync }));

describe("readWslLoginPath", () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  const loginPath = "/usr/local/bin:/usr/bin";
  let cacheHome = "";

  beforeEach(() => {
    // Reset the module so its memoized PATH does not leak between cases, and seed the default capture output.
    vi.resetModules();
    execFileSync.mockReset();
    execFileSync.mockReturnValue(`noise\n${PATH_BEGIN}${loginPath}${PATH_END}`);
    // Isolate the persisted cross-process cache in a fresh temp dir so a real ~/.virrun never leaks into a case.
    cacheHome = create();
    process.env[VIRRUN_CACHE_HOME_KEY] = cacheHome;
  });

  afterEach(() => {
    delete process.env[VIRRUN_CACHE_HOME_KEY];
    cleanup();
  });

  test("extracts the PATH between the markers, memoizes it, and persists the capture", async () => {
    expect.hasAssertions();

    const { readWslLoginPath } = await import("@/services/exec/wsl/readWslLoginPath");

    expect(readWslLoginPath()).toBe(loginPath);
    expect(readWslLoginPath()).toBe(loginPath);
    expect(execFileSync).toHaveBeenCalledTimes(1);
    expect(existsSync(join(cacheHome, WSL_LOGIN_PATH_CACHE_FILENAME))).toBe(true);
  });

  test("captures through the user's interactive login shell", async () => {
    expect.hasAssertions();

    const { readWslLoginPath } = await import("@/services/exec/wsl/readWslLoginPath");
    readWslLoginPath();
    const { calls } = execFileSync.mock;
    const [file, args] = takeOne(calls, calls.length - 1);
    const script = takeOne(args ?? [], 3);

    expect(file).toBe("wsl.exe");
    expect([takeOne(args ?? []), takeOne(args ?? [], 1), takeOne(args ?? [], 2)]).toStrictEqual(["--exec", "sh", "-c"]);
    expect(script).toContain("-lic");
    expect(script).toContain("getent passwd");
  });

  test("reuses the persisted PATH across processes without re-probing", async () => {
    expect.hasAssertions();

    writeWslEnvironmentCache(WSL_LOGIN_PATH_CACHE_FILENAME, { key: getHostFingerprint(), value: loginPath });
    const { readWslLoginPath } = await import("@/services/exec/wsl/readWslLoginPath");

    expect(readWslLoginPath()).toBe(loginPath);
    expect(execFileSync).toHaveBeenCalledTimes(0);
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

  test("does not persist a failed capture", async () => {
    expect.hasAssertions();

    execFileSync.mockReturnValue("");
    const { readWslLoginPath } = await import("@/services/exec/wsl/readWslLoginPath");
    readWslLoginPath();

    expect(existsSync(join(cacheHome, WSL_LOGIN_PATH_CACHE_FILENAME))).toBe(false);
  });
});
