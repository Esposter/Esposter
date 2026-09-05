import { stripAnsi } from "#src/services/cli/color/stripAnsi.test";
import { writeVirrunDebug } from "#src/services/cli/debug/writeVirrunDebug";
import { VIRRUN_DEBUG_KEY } from "#src/services/exec/util/constants";
import { takeOne } from "@esposter/shared";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(writeVirrunDebug, () => {
  const message = "task cache off";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("writes the formatted line to stderr when the debug env is set", () => {
    expect.hasAssertions();

    vi.stubEnv(VIRRUN_DEBUG_KEY, "true");
    const write = vi.spyOn(process.stderr, "write").mockReturnValue(true);

    writeVirrunDebug(message);

    expect(write.mock.calls).toHaveLength(1);
    expect(stripAnsi(String(takeOne(write.mock.calls)[0]))).toBe(`[virrun] debug — ${message}\n`);
  });

  test("is silent when the debug env is unset", () => {
    expect.hasAssertions();

    vi.stubEnv(VIRRUN_DEBUG_KEY, undefined);
    const write = vi.spyOn(process.stderr, "write").mockReturnValue(true);

    writeVirrunDebug(message);

    expect(write).not.toHaveBeenCalled();
  });
});
