import type { execFileSync as baseExecFileSync } from "node:child_process";

import { WSL_PROBE_TIMEOUT_MS, WSL_WORK_TIMEOUT_MS } from "#src/services/exec/util/constants";
import { WSL_EXECUTABLE } from "#src/services/exec/wsl/constants";
import { TEST_WSL_DISTRO } from "#src/services/exec/wsl/constants.test";
import { execWsl } from "#src/services/exec/wsl/execWsl";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { execFileSync } = vi.hoisted(() => ({ execFileSync: vi.fn<typeof baseExecFileSync>() }));

vi.mock(import("node:child_process"), () => ({ execFileSync: execFileSync as unknown as typeof baseExecFileSync }));

describe(execWsl, () => {
  beforeEach(() => {
    execFileSync.mockReset();
    execFileSync.mockReturnValue(Buffer.from(""));
  });

  // A wedged WSL service never answers a spawn rather than failing it, so an unbounded execFileSync hangs the
  // One-shot CLI forever with nothing printed — every call is bounded, whether or not its site remembered to say so
  test("runs wsl.exe with a hidden buffered capture, bounded by the wsl timeout", () => {
    expect.hasAssertions();

    execFileSync.mockReturnValue(Buffer.from("a"));

    expect(execWsl(["--exec", "sh"])).toBe("a");
    expect(execFileSync).toHaveBeenCalledExactlyOnceWith(WSL_EXECUTABLE, ["--exec", "sh"], {
      encoding: "buffer",
      stdio: "pipe",
      timeout: WSL_PROBE_TIMEOUT_MS,
      windowsHide: true,
    });
  });

  test("lets a call doing real work raise the bound above the wsl default", () => {
    expect.hasAssertions();

    execWsl(["--exec", "sh"], { timeout: WSL_WORK_TIMEOUT_MS });

    expect(execFileSync).toHaveBeenCalledExactlyOnceWith(WSL_EXECUTABLE, ["--exec", "sh"], {
      encoding: "buffer",
      stdio: "pipe",
      timeout: WSL_WORK_TIMEOUT_MS,
      windowsHide: true,
    });
  });

  test("decodes a launch failure's UTF-16LE stderr, which utf8 would render unreadable", () => {
    expect.hasAssertions();

    execFileSync.mockImplementation(() => {
      throw Object.assign(new Error(" "), {
        stderr: Buffer.from("stderr", "utf16le"),
      });
    });

    expect(() => execWsl(["--exec", "sh"])).toThrowErrorMatchingInlineSnapshot(`
      [ExecFileError: Command failed: wsl.exe --exec sh
      stderr]
    `);
  });

  test("callers reading wsl.exe's own stdout override the encoding, keeping the utf16le stderr", () => {
    expect.hasAssertions();

    execFileSync.mockReturnValue(Buffer.from(TEST_WSL_DISTRO, "utf16le"));

    expect(execWsl(["-l", "-q"], { encoding: "utf16le" })).toBe(TEST_WSL_DISTRO);
  });
});
