import type { WishDrawSave } from "#src/models/wish/WishDrawSave";

import { MAX_WISH_HISTORY_COUNT } from "#src/services/save/constants";
import { appendWishHistory } from "#src/services/wish/appendWishHistory";
import { BannerKind } from "genshin-interface";
import { describe, expect, test } from "vitest";

// The instant the given hours after the epoch
const atHour = (hours: number): Temporal.Instant => Temporal.Instant.fromEpochMilliseconds(0).add({ hours });
const createDraw = (instant: Temporal.Instant, itemId = 10_000_116): WishDrawSave => ({
  bannerKind: BannerKind.CharacterEvent,
  itemId,
  time: instant.toString(),
});

describe(appendWishHistory, () => {
  const now = atHour(24 * 1000);

  test("a draw appears in the history with its kind, item and time", () => {
    expect.hasAssertions();

    const draw = createDraw(now, 10_000_116);
    expect(appendWishHistory([], [draw], now)).toStrictEqual([draw]);
  });

  test("history keeps draws within the year and drops the older", () => {
    expect.hasAssertions();

    const kept = createDraw(now.subtract({ hours: 24 * 364 }));
    const dropped = createDraw(now.subtract({ hours: 24 * 366 }));
    const draw = createDraw(now);
    expect(appendWishHistory([dropped, kept], [draw], now)).toStrictEqual([kept, draw]);
  });

  test("history keeps no more than its bound, the most recent", () => {
    expect.hasAssertions();

    const draws = Array.from({ length: MAX_WISH_HISTORY_COUNT + 1 }, (_value, index) =>
      createDraw(now.add({ seconds: index })),
    );
    const history = appendWishHistory([], draws, now);
    expect(history).toHaveLength(MAX_WISH_HISTORY_COUNT);
    expect(history[0]).toStrictEqual(draws[1]);
  });
});
