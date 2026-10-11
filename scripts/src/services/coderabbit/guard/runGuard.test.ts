import type { RedStreak } from "#src/models/coderabbit/guard/RedStreak";
import type { writeJobOutput as baseWriteJobOutput } from "#src/services/coderabbit/collect/writeJobOutput";
import type { readHeldStreak as baseReadHeldStreak } from "#src/services/coderabbit/guard/readHeldStreak";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import { getFailureSignature } from "#src/services/coderabbit/collect/getFailureSignature";
import { IS_WAKING_OUTPUT } from "#src/services/coderabbit/guard/constants";
import { runGuard } from "#src/services/coderabbit/guard/runGuard";
import { describe, expect, test, vi } from "vitest";

const { readHeldStreak, runGh, writeJobOutput } = vi.hoisted(() => ({
  readHeldStreak: vi.fn<typeof baseReadHeldStreak>(),
  runGh: vi.fn<typeof baseRunGh>(),
  writeJobOutput: vi.fn<typeof baseWriteJobOutput>(),
}));

vi.mock(import("#src/services/coderabbit/guard/readHeldStreak"), () => ({
  readHeldStreak: readHeldStreak as unknown as typeof baseReadHeldStreak,
}));

vi.mock(import("#src/services/coderabbit/collect/writeJobOutput"), () => ({
  writeJobOutput: writeJobOutput as unknown as typeof baseWriteJobOutput,
}));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

describe(runGuard, () => {
  const streak: RedStreak = { createdAt: "", isSetup: false, signature: getFailureSignature("", []) };

  test("holds the cycle once the issue on its red is open", () => {
    expect.hasAssertions();

    readHeldStreak.mockReturnValue(streak);
    runGh.mockReturnValue("[]");
    runGuard();

    expect(writeJobOutput).toHaveBeenCalledExactlyOnceWith(IS_WAKING_OUTPUT, "false");
  });

  // A hold no issue reports leaves the cycle asleep with nobody told, so a refused issue leaves the output unwritten,
  // Which the workflow reads as a wake
  test("writes no hold when GitHub refuses the issue on its red", () => {
    expect.hasAssertions();

    readHeldStreak.mockReturnValue(streak);
    runGh.mockImplementation((args) => {
      if (args[1] === "create") throw new Error("was submitted too quickly");
      return "[]";
    });

    expect(() => {
      runGuard();
    }).toThrowErrorMatchingInlineSnapshot(`[Error: was submitted too quickly]`);
    expect(writeJobOutput).not.toHaveBeenCalled();
  });
});
