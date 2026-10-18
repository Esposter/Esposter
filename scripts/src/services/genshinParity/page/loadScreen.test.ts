import type { LoadBench } from "genshin-world/parity/models/LoadBench";
import type { Page } from "playwright";

import { loadScreen } from "#src/services/genshinParity/page/loadScreen";
import { openParityPage } from "#src/services/genshinParity/shared/openParityPage";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinParity/shared/openParityPage"), () => ({
  openParityPage: vi.fn<typeof openParityPage>(),
}));

const BENCH = {
  gameDataBytes: 1,
  gameDataRequests: 2,
  geometries: 3,
  kindCounts: {},
  longFrameMs: 0,
  measures: [],
  programs: 4,
  requests: 5,
  textures: 6,
  totalBytes: 7,
} satisfies LoadBench;

describe(loadScreen, () => {
  test("opens the page at its load event and reads ready and the bench together at the ready signal", async () => {
    expect.hasAssertions();

    const evaluate = vi.fn<() => Promise<unknown>>().mockResolvedValue({ bench: BENCH, readyMs: 250 });
    const close = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    vi.mocked(openParityPage).mockResolvedValue({ close, page: { evaluate } as unknown as Page });

    const reading = await loadScreen({ height: 1080, screen: "WorldScreen", width: 1920 });

    expect(vi.mocked(openParityPage).mock.lastCall?.[0]).toStrictEqual({
      height: 1080,
      isFrameRateUnlimited: false,
      isOpenedAtLoad: true,
      screen: "WorldScreen",
      width: 1920,
    });
    expect(evaluate).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(reading).toStrictEqual({ bench: BENCH, readyMs: 250 });
  });
});
