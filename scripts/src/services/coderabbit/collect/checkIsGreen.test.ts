import type { spawnPnpm as baseSpawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";

import { checkIsGreen } from "#src/services/coderabbit/collect/checkIsGreen";
import { describe, expect, test, vi } from "vitest";

const { spawnPnpm } = vi.hoisted(() => ({ spawnPnpm: vi.fn<typeof baseSpawnPnpm>() }));

vi.mock(import("#src/services/coderabbit/collect/spawnPnpm"), () => ({
  spawnPnpm: spawnPnpm as unknown as typeof baseSpawnPnpm,
}));

describe(checkIsGreen, () => {
  // A `timeout` of nothing or less is no timeout to `spawnSync`, so a check started past the deadline would run as long
  // As it liked and hold the attempt past the bound it exists for
  test("fails without running a check once the attempt's deadline has passed", () => {
    expect.hasAssertions();

    expect(checkIsGreen("", 0)).toBe(false);
    expect(spawnPnpm).not.toHaveBeenCalled();
  });
});
