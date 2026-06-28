import { toExitCode } from "@/services/exec/util/toExitCode";
import { describe, expect, test } from "vitest";

describe(toExitCode, () => {
  test("returns the exit code for a normal exit", () => {
    expect.hasAssertions();

    expect(toExitCode(0, null)).toBe(0);
    expect(toExitCode(3, null)).toBe(3);
  });

  test("maps signal termination to the shell's 128+signal convention", () => {
    expect.hasAssertions();

    // SIGINT (2) ↁE130, SIGKILL (9) ↁE137, SIGTERM (15) ↁE143.
    expect(toExitCode(null, "SIGINT")).toBe(130);
    expect(toExitCode(null, "SIGKILL")).toBe(137);
    expect(toExitCode(null, "SIGTERM")).toBe(143);
  });

  test("falls back to 0 when neither a code nor a signal is reported", () => {
    expect.hasAssertions();

    expect(toExitCode(null, null)).toBe(0);
  });
});
