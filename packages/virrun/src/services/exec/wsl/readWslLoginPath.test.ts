import type { execFileSync as baseExecFileSync } from "node:child_process";

import { setupTemporaryCacheHome } from "@/services/exec/test/setupTemporaryCacheHome.test";
import { WSL_LOGIN_PATH_CACHE_FILENAME } from "@/services/exec/util/constants";
import { getHostFingerprint } from "@/services/exec/util/getHostFingerprint";
import { VIRRUN_LOGIN_PATH_BEGIN_MARKER, VIRRUN_LOGIN_PATH_END_MARKER } from "@/services/exec/wsl/constants";
import { writeWslEnvironmentCache } from "@/services/exec/wsl/writeWslEnvironmentCache";
import { takeOne } from "@esposter/shared";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { execFileSync } = vi.hoisted(() => ({ execFileSync: vi.fn<typeof baseExecFileSync>() }));

vi.mock(import("node:child_process"), () => ({ execFileSync: execFileSync as unknown as typeof baseExecFileSync }));

describe("readWslLoginPath", () => {
  // The shared cache-home fixture isolates the persisted cross-process cache per test.
  const { getCacheHome } = setupTemporaryCacheHome();
  const loginPath = "/usr/local/bin:/usr/bin";

  beforeEach(() => {
    // Reset the module so its memoized PATH does not leak between cases, and seed the default capture output.
    vi.resetModules();
    execFileSync.mockReset();
    execFileSync.mockReturnValue(`noise\n${VIRRUN_LOGIN_PATH_BEGIN_MARKER}${loginPath}${VIRRUN_LOGIN_PATH_END_MARKER}`);
  });

  test("extracts the PATH between the markers, memoizes it, and persists the capture", async () => {
    expect.hasAssertions();

    const { readWslLoginPath } = await import("@/services/exec/wsl/readWslLoginPath");

    expect(readWslLoginPath()).toBe(loginPath);
    expect(readWslLoginPath()).toBe(loginPath);
    expect(execFileSync).toHaveBeenCalledTimes(1);
    expect(existsSync(join(getCacheHome(), WSL_LOGIN_PATH_CACHE_FILENAME))).toBe(true);
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
    expect(script).toMatchInlineSnapshot(
      `"SHELL_BIN="\${SHELL:-}"; [ -x "$SHELL_BIN" ] || SHELL_BIN="$(getent passwd "$(id -un)" 2>/dev/null | cut -d: -f7)"; [ -x "$SHELL_BIN" ] || SHELL_BIN=/bin/sh; exec "$SHELL_BIN" -lic 'nodeBin="$(command -v node 2>/dev/null)"; [ -n "$nodeBin" ] && PATH="$(dirname "$(readlink -f "$nodeBin")"):$PATH"; printf "__VIRRUN_LOGIN_PATH_BEGIN__%s__VIRRUN_LOGIN_PATH_END__" "$PATH"'"`,
    );
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

    expect(existsSync(join(getCacheHome(), WSL_LOGIN_PATH_CACHE_FILENAME))).toBe(false);
  });
});
