import type { execFileSync as baseExecFileSync } from "node:child_process";

import { setupTemporaryCacheHome } from "#src/services/exec/test/setupTemporaryCacheHome.test";
import { WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME } from "#src/services/exec/util/constants";
import { getHostFingerprint } from "#src/services/exec/util/getHostFingerprint";
import {
  VIRRUN_LOGIN_NODE_BEGIN_MARKER,
  VIRRUN_LOGIN_NODE_END_MARKER,
  VIRRUN_LOGIN_PATH_BEGIN_MARKER,
  VIRRUN_LOGIN_PATH_END_MARKER,
} from "#src/services/exec/wsl/constants";
import { TEST_WSL_LOGIN_ENVIRONMENT } from "#src/services/exec/wsl/constants.test";
import { writeWslEnvironmentCache } from "#src/services/exec/wsl/writeWslEnvironmentCache";
import { takeOne } from "@esposter/shared";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { execFileSync } = vi.hoisted(() => ({ execFileSync: vi.fn<typeof baseExecFileSync>() }));

vi.mock(import("node:child_process"), () => ({ execFileSync: execFileSync as unknown as typeof baseExecFileSync }));

describe("readWslLoginEnvironment", () => {
  // The shared cache-home fixture isolates the persisted cross-process cache per test.
  const { getCacheHome } = setupTemporaryCacheHome();
  // The capture every suite mocking `readWslLoginEnvironment` hands back — asserted here against the real parse, so
  // The two never drift into describing different login environments
  const environment = TEST_WSL_LOGIN_ENVIRONMENT;
  const { nodeVersion, path } = environment;

  beforeEach(() => {
    // Reset the module so its memoized capture does not leak between cases, and seed the default capture output.
    vi.resetModules();
    execFileSync.mockReset();
    execFileSync.mockReturnValue(
      `noise\n${VIRRUN_LOGIN_PATH_BEGIN_MARKER}${path}${VIRRUN_LOGIN_PATH_END_MARKER}${VIRRUN_LOGIN_NODE_BEGIN_MARKER}${nodeVersion}${VIRRUN_LOGIN_NODE_END_MARKER}`,
    );
  });

  test("extracts the PATH and node version between their markers, memoizes them, and persists the capture", async () => {
    expect.hasAssertions();

    const { readWslLoginEnvironment } = await import("#src/services/exec/wsl/readWslLoginEnvironment");

    expect(readWslLoginEnvironment()).toStrictEqual(environment);
    expect(readWslLoginEnvironment()).toStrictEqual(environment);
    expect(execFileSync).toHaveBeenCalledTimes(1);
    expect(existsSync(join(getCacheHome(), WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME))).toBe(true);
  });

  test("captures through the user's interactive login shell", async () => {
    expect.hasAssertions();

    const { readWslLoginEnvironment } = await import("#src/services/exec/wsl/readWslLoginEnvironment");
    readWslLoginEnvironment();
    const { calls } = execFileSync.mock;
    const [file, args] = takeOne(calls, calls.length - 1);
    const script = takeOne(args ?? [], 3);

    expect(file).toBe("wsl.exe");
    expect([takeOne(args ?? []), takeOne(args ?? [], 1), takeOne(args ?? [], 2)]).toStrictEqual(["--exec", "sh", "-c"]);
    expect(script).toMatchInlineSnapshot(
      `"SHELL_BIN="\${SHELL:-}"; [ -x "$SHELL_BIN" ] || SHELL_BIN="$(getent passwd "$(id -un)" 2>/dev/null | cut -d: -f7)"; [ -x "$SHELL_BIN" ] || SHELL_BIN=/bin/sh; exec "$SHELL_BIN" -lic 'nodeBin="$(command -v node 2>/dev/null)"; [ -n "$nodeBin" ] && PATH="$(dirname "$(readlink -f "$nodeBin")"):$PATH"; nodeVersion="$(node --version 2>/dev/null)"; printf "__VIRRUN_LOGIN_PATH_BEGIN__%s__VIRRUN_LOGIN_PATH_END____VIRRUN_LOGIN_NODE_BEGIN__%s__VIRRUN_LOGIN_NODE_END__" "$PATH" "$nodeVersion"'"`,
    );
  });

  test("reuses the persisted capture across processes without re-probing", async () => {
    expect.hasAssertions();

    writeWslEnvironmentCache(WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME, { key: getHostFingerprint(), value: environment });
    const { readWslLoginEnvironment } = await import("#src/services/exec/wsl/readWslLoginEnvironment");

    expect(readWslLoginEnvironment()).toStrictEqual(environment);
    expect(execFileSync).not.toHaveBeenCalled();
  });

  test("re-probes when the persisted capture has aged out — the toolchain switch the host key cannot see", async () => {
    expect.hasAssertions();

    // A capture stamped long ago under this very host key: the node manager's active version may have moved since,
    // Which is exactly the drift that would otherwise pin the sandbox to the old node forever.
    writeFileSync(
      join(getCacheHome(), WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME),
      JSON.stringify({
        key: getHostFingerprint(),
        storedAtMs: 0,
        value: { nodeVersion: "v26.4.0", path: "/stale/bin" },
      }),
    );
    const { readWslLoginEnvironment } = await import("#src/services/exec/wsl/readWslLoginEnvironment");

    expect(readWslLoginEnvironment()).toStrictEqual(environment);
    expect(execFileSync).toHaveBeenCalledTimes(1);
  });

  test("degrades to an empty environment when the marked output is absent", async () => {
    expect.hasAssertions();

    execFileSync.mockReturnValue("");
    const { readWslLoginEnvironment } = await import("#src/services/exec/wsl/readWslLoginEnvironment");

    expect(readWslLoginEnvironment()).toStrictEqual({ nodeVersion: "", path: "" });
  });

  test("degrades to an empty environment when WSL is unavailable", async () => {
    expect.hasAssertions();

    execFileSync.mockImplementation(() => {
      throw new Error("wsl.exe not found");
    });
    const { readWslLoginEnvironment } = await import("#src/services/exec/wsl/readWslLoginEnvironment");

    expect(readWslLoginEnvironment()).toStrictEqual({ nodeVersion: "", path: "" });
  });

  test("does not persist a failed capture", async () => {
    expect.hasAssertions();

    execFileSync.mockReturnValue("");
    const { readWslLoginEnvironment } = await import("#src/services/exec/wsl/readWslLoginEnvironment");
    readWslLoginEnvironment();

    expect(existsSync(join(getCacheHome(), WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME))).toBe(false);
  });

  test("does not persist a capture that resolved a PATH but found no node on it", async () => {
    expect.hasAssertions();

    execFileSync.mockReturnValue(
      `${VIRRUN_LOGIN_PATH_BEGIN_MARKER}${path}${VIRRUN_LOGIN_PATH_END_MARKER}${VIRRUN_LOGIN_NODE_BEGIN_MARKER}${VIRRUN_LOGIN_NODE_END_MARKER}`,
    );
    const { readWslLoginEnvironment } = await import("#src/services/exec/wsl/readWslLoginEnvironment");

    expect(readWslLoginEnvironment()).toStrictEqual({ nodeVersion: "", path });
    // Persisting it would pin every later process to a version computeEnvironmentKey refuses to key on, for the
    // Cache's whole age bound, with no run able to recover on its own.
    expect(existsSync(join(getCacheHome(), WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME))).toBe(false);
  });
});
