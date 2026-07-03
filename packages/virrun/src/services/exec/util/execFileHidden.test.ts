import type { execFileSync as baseExecFileSync } from "node:child_process";

import { execFileHidden } from "@/services/exec/util/execFileHidden";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { execFileSync } = vi.hoisted(() => ({ execFileSync: vi.fn<typeof baseExecFileSync>() }));

vi.mock(import("node:child_process"), () => ({ execFileSync: execFileSync as unknown as typeof baseExecFileSync }));

describe(execFileHidden, () => {
  beforeEach(() => {
    execFileSync.mockReset();
    execFileSync.mockReturnValue("");
  });

  test("defaults to a hidden utf8 pipe capture", () => {
    expect.hasAssertions();

    execFileHidden("git", ["status"]);

    expect(execFileSync).toHaveBeenCalledExactlyOnceWith("git", ["status"], {
      encoding: "utf8",
      stdio: "pipe",
      windowsHide: true,
    });
  });

  test("callers override encoding/stdio/timeout but never windowsHide", () => {
    expect.hasAssertions();

    execFileHidden("wsl.exe", ["-l", "-q"], { encoding: "utf16le", stdio: "inherit", timeout: 1 });

    expect(execFileSync).toHaveBeenCalledExactlyOnceWith("wsl.exe", ["-l", "-q"], {
      encoding: "utf16le",
      stdio: "inherit",
      timeout: 1,
      windowsHide: true,
    });
  });

  test("returns the captured stdout", () => {
    expect.hasAssertions();

    execFileSync.mockReturnValue(" ");

    expect(execFileHidden("git", [])).toBe(" ");
  });
});
