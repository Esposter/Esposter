import type { execFileSync as baseExecFileSync } from "node:child_process";

import { WSL_PROBE_TIMEOUT_MS } from "#src/services/exec/util/constants";
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
  // One-shot CLI forever with nothing printed — every call carries the bound its site named
  test("runs wsl.exe with a hidden buffered capture, bounded by the timeout it is given", () => {
    expect.hasAssertions();

    execFileSync.mockReturnValue(Buffer.from("a"));

    expect(execWsl(["--exec", "sh"], { timeout: WSL_PROBE_TIMEOUT_MS })).toBe("a");
    expect(execFileSync).toHaveBeenCalledExactlyOnceWith(WSL_EXECUTABLE, ["--exec", "sh"], {
      encoding: "buffer",
      stdio: "pipe",
      timeout: WSL_PROBE_TIMEOUT_MS,
      windowsHide: true,
    });
  });

  // The shape wsl.exe really fails with: its reason on stdout in UTF-16LE, stderr empty
  test("names a launch failure by its UTF-16LE stdout", () => {
    expect.hasAssertions();

    execFileSync.mockImplementation(() => {
      throw Object.assign(new Error(" "), { stderr: Buffer.from(""), stdout: Buffer.from("stdout", "utf16le") });
    });

    expect(() => execWsl(["--exec", "sh"], { timeout: WSL_PROBE_TIMEOUT_MS })).toThrowErrorMatchingInlineSnapshot(`
      [ExecFileError: Command failed: wsl.exe --exec sh
      stdout]
    `);
  });

  test("callers reading wsl.exe's own stdout override the encoding, keeping the utf16le stderr", () => {
    expect.hasAssertions();

    execFileSync.mockReturnValue(Buffer.from(TEST_WSL_DISTRO, "utf16le"));

    expect(execWsl(["-l", "-q"], { encoding: "utf16le", timeout: WSL_PROBE_TIMEOUT_MS })).toBe(TEST_WSL_DISTRO);
  });
});
