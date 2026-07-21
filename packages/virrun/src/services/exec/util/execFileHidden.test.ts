import type { execFileSync as baseExecFileSync } from "node:child_process";

import { execFileHidden } from "@/services/exec/util/execFileHidden";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { execFileSync } = vi.hoisted(() => ({ execFileSync: vi.fn<typeof baseExecFileSync>() }));

vi.mock(import("node:child_process"), () => ({ execFileSync: execFileSync as unknown as typeof baseExecFileSync }));

// The shape Node raises for a failed spawn: an Error carrying the child's UNDECODED stderr, since the spawn always
// Captures in `buffer`. wsl.exe writes its own diagnostics as UTF-16LE, which only stderrEncoding can read back.
const mockFailure = (stderr: string, stderrEncoding: BufferEncoding): void => {
  execFileSync.mockImplementation(() => {
    throw Object.assign(new Error("Command failed"), { status: 1, stderr: Buffer.from(stderr, stderrEncoding) });
  });
};

describe(execFileHidden, () => {
  beforeEach(() => {
    execFileSync.mockReset();
    execFileSync.mockReturnValue(Buffer.from(""));
  });

  test("captures hidden buffered stdout and decodes it as utf8", () => {
    expect.hasAssertions();

    execFileSync.mockReturnValue(Buffer.from("a"));

    expect(execFileHidden("git", ["status"])).toBe("a");
    expect(execFileSync).toHaveBeenCalledExactlyOnceWith("git", ["status"], {
      encoding: "buffer",
      stdio: "pipe",
      windowsHide: true,
    });
  });

  test("decodes stdout with the caller's encoding, never handing it to the spawn", () => {
    expect.hasAssertions();

    execFileSync.mockReturnValue(Buffer.from("a", "utf16le"));

    expect(execFileHidden("wsl.exe", ["-l", "-q"], { encoding: "utf16le", stderrEncoding: "utf16le" })).toBe("a");
    expect(execFileSync).toHaveBeenCalledExactlyOnceWith("wsl.exe", ["-l", "-q"], {
      encoding: "buffer",
      stdio: "pipe",
      windowsHide: true,
    });
  });

  test("callers override stdio/timeout but never windowsHide", () => {
    expect.hasAssertions();

    execFileHidden("git", ["status"], { stdio: "inherit", timeout: 1 });

    expect(execFileSync).toHaveBeenCalledExactlyOnceWith("git", ["status"], {
      encoding: "buffer",
      stdio: "inherit",
      timeout: 1,
      windowsHide: true,
    });
  });

  test("encodes a string stdin with the caller's encoding, never the capture's", () => {
    expect.hasAssertions();

    execFileHidden("python3", ["-"], { input: "a" });

    expect(execFileSync).toHaveBeenCalledExactlyOnceWith("python3", ["-"], {
      encoding: "buffer",
      input: Buffer.from("a"),
      stdio: "pipe",
      windowsHide: true,
    });
  });

  test("returns an empty string when stdout was not piped", () => {
    expect.hasAssertions();

    // What Node really returns when stdout is not piped, which its own types don't model.
    execFileSync.mockReturnValue(null as unknown as string);

    expect(execFileHidden("git", ["status"], { stdio: "inherit" })).toBe("");
  });

  test("raises the failure with its stderr decoded by stderrEncoding", () => {
    expect.hasAssertions();

    mockFailure("Wsl/Service/E_UNEXPECTED", "utf16le");

    expect(() => execFileHidden("wsl.exe", ["--exec", "sh"], { stderrEncoding: "utf16le" }))
      .toThrowErrorMatchingInlineSnapshot(`
      [ExecFileError: Command failed: wsl.exe --exec sh
      Wsl/Service/E_UNEXPECTED]
    `);
  });

  test("defaults stderrEncoding to the stdout encoding", () => {
    expect.hasAssertions();

    mockFailure("tar: Cannot open", "utf8");

    expect(() => execFileHidden("tar", ["-c"])).toThrowErrorMatchingInlineSnapshot(`
      [ExecFileError: Command failed: tar -c
      tar: Cannot open]
    `);
  });

  test("raises the failure with an empty stderr when it was not piped", () => {
    expect.hasAssertions();

    execFileSync.mockImplementation(() => {
      throw new Error("Command failed");
    });

    expect(() => execFileHidden("git", ["status"], { stdio: "inherit" })).toThrowErrorMatchingInlineSnapshot(`
      [ExecFileError: Command failed: git status
      ]
    `);
  });
});
