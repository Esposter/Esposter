import type { spawnPnpm as baseSpawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";

import { checkIsGreen } from "#src/services/coderabbit/collect/checkIsGreen";
import { REPAIR_VERIFY_COMMANDS, REPAIR_VERIFY_TIMEOUT_MS } from "#src/services/coderabbit/collect/constants";
import { takeOne } from "@esposter/shared";
import { afterEach, describe, expect, test, vi } from "vitest";

const { spawnPnpm } = vi.hoisted(() => ({ spawnPnpm: vi.fn<typeof baseSpawnPnpm>() }));

vi.mock(import("#src/services/coderabbit/collect/spawnPnpm"), () => ({
  spawnPnpm: spawnPnpm as unknown as typeof baseSpawnPnpm,
}));

describe(checkIsGreen, () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  // A `timeout` of nothing or less is no timeout to `spawnSync`, so a check started past the clock would run as long as
  // It liked and hold the attempt past the bound it exists for
  test("fails without starting another check once the suite's clock has run out", () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    spawnPnpm.mockImplementation(() => {
      vi.setSystemTime(REPAIR_VERIFY_TIMEOUT_MS);
      return { output: [], pid: 0, signal: null, status: 0, stderr: "", stdout: "" };
    });

    expect(checkIsGreen("")).toBe(false);
    expect(spawnPnpm).toHaveBeenCalledExactlyOnceWith(takeOne(REPAIR_VERIFY_COMMANDS), {
      cwd: "",
      stdio: "inherit",
      timeout: REPAIR_VERIFY_TIMEOUT_MS,
    });
  });
});
