import type { execFileSync as baseExecFileSync } from "node:child_process";

import { ExecFileError } from "#src/models/exec/util/ExecFileError";
import { execFileHidden } from "#src/services/exec/util/execFileHidden";
import { getResult, noop } from "@esposter/shared";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { execFileSync } = vi.hoisted(() => ({ execFileSync: vi.fn<typeof baseExecFileSync>() }));

vi.mock(import("node:child_process"), () => ({ execFileSync: execFileSync as unknown as typeof baseExecFileSync }));

// The shape Node raises for a failed spawn: an Error carrying the child's UNDECODED stderr, since the spawn always
// Captures in `buffer`. wsl.exe writes its own diagnostics as UTF-16LE, which the wrapper detects from the bytes.
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

    expect(execFileHidden("wsl.exe", ["-l", "-q"], { encoding: "utf16le" })).toBe("a");
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

  // The call site declares nothing about stderr, which is the point: runOverlayScript spawned wsl.exe straight
  // Through here and its every launch failure arrived as an empty reason until the encoding was detected instead
  test("detects a UTF-16LE stderr no caller declared", () => {
    expect.hasAssertions();

    mockFailure("Wsl/Service/E_UNEXPECTED", "utf16le");

    expect(() => execFileHidden("wsl.exe", ["--exec", "python3"])).toThrowErrorMatchingInlineSnapshot(`
      [ExecFileError: Command failed: wsl.exe --exec python3
      Wsl/Service/E_UNEXPECTED]
    `);
  });

  test("reads a utf8 stderr as written", () => {
    expect.hasAssertions();

    mockFailure("tar: Cannot open", "utf8");

    expect(() => execFileHidden("tar", ["-c"])).toThrowErrorMatchingInlineSnapshot(`
      [ExecFileError: Command failed: tar -c
      tar: Cannot open]
    `);
  });

  // A capture the timeout killed mid-write can end on an odd byte; the padding still identifies utf16le and the
  // Decoder drops the dangling byte, instead of falling back to utf8 and rendering NUL-interleaved garbage
  test("detects a truncated odd-length UTF-16LE stderr", () => {
    expect.hasAssertions();

    execFileSync.mockImplementation(() => {
      throw Object.assign(new Error("Command failed"), {
        signal: "SIGTERM",
        status: null,
        stderr: Buffer.from("Wsl/Service/E_UNEXPECTED", "utf16le").subarray(0, -1),
      });
    });

    expect(() => execFileHidden("wsl.exe", ["--exec", "python3"])).toThrowErrorMatchingInlineSnapshot(`
      [ExecFileError: Command failed: wsl.exe --exec python3
      Wsl/Service/E_UNEXPECTE]
    `);
  });

  // The utf16le shape is NUL-padded characters; a utf8 traceback that happens to be even-length
  // Must not be mistaken for one, since decoding it that way would render it as unreadable CJK
  test("reads an even-length utf8 stderr as utf8", () => {
    expect.hasAssertions();

    mockFailure("OSError: [Errno 1] Operation not permitted", "utf8");

    expect(() => execFileHidden("wsl.exe", ["--exec", "python3"])).toThrowErrorMatchingInlineSnapshot(`
      [ExecFileError: Command failed: wsl.exe --exec python3
      OSError: [Errno 1] Operation not permitted]
    `);
  });

  test("carries the signal of a child the timeout killed", () => {
    expect.hasAssertions();

    // A killed child's stderr is whatever it had written when it died, so callers that classify that text need
    // The kill itself surfaced — otherwise a truncated fragment reads like a complete verdict
    execFileSync.mockImplementation(() => {
      throw Object.assign(new Error("Command failed"), {
        signal: "SIGTERM",
        status: null,
        stderr: Buffer.from("tar: Couldn't open a: b"),
      });
    });

    const error = getResult(() => execFileHidden("tar", ["-c"])).match(noop, (failure) => failure);

    expect((error as ExecFileError).signal).toBe("SIGTERM");
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
