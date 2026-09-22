import {
  SIGNAL_EXIT_CODE_BASE,
  WSL_SOURCE_MIRROR_LOCK_FAILURE_MARKER,
  WSL_SOURCE_MIRROR_SYNC_FAILURE_MARKER,
} from "#src/services/exec/bwrap/constants";
import { getNoStatusFailureHeadline } from "#src/services/exec/bwrap/getNoStatusFailureHeadline";
import { constants } from "node:os";
import { describe, expect, test } from "vitest";

describe(getNoStatusFailureHeadline, () => {
  const SIGTERM_NUMBER = constants.signals.SIGTERM;

  test("names the prelude that failed before the sandbox started", () => {
    expect.hasAssertions();

    expect(getNoStatusFailureHeadline(WSL_SOURCE_MIRROR_SYNC_FAILURE_MARKER)).toBe(
      "the source mirror sync failed before the sandbox started",
    );
    expect(getNoStatusFailureHeadline(WSL_SOURCE_MIRROR_LOCK_FAILURE_MARKER)).toBe(
      "the source mirror lock was never acquired, so the sandbox never started",
    );
  });

  // The whole point of the helper: a run another process killed — a concurrent run's startup orphan sweep, a
  // Terminal's Ctrl+C — reaches here with no status block and, on the wsl backend, no stderr at all, which is
  // Indistinguishable from a sandbox-setup failure unless the exit status is read.
  test("names the signal that killed the run rather than blaming bubblewrap", () => {
    expect.hasAssertions();

    expect(getNoStatusFailureHeadline("", undefined, "SIGTERM")).toBe(
      "the sandbox was killed by SIGTERM — an external kill, not a bwrap failure",
    );
    expect(getNoStatusFailureHeadline("", SIGNAL_EXIT_CODE_BASE + SIGTERM_NUMBER)).toBe(
      `the sandbox was killed by signal ${SIGTERM_NUMBER} — an external kill, not a bwrap failure`,
    );
  });

  test("blames bubblewrap only for an ordinary non-signal failure", () => {
    expect.hasAssertions();

    expect(getNoStatusFailureHeadline("", 1)).toBe("bubblewrap failed to set up the sandbox");
  });
});
