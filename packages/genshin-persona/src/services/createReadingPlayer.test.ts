import type { AudioPlayer } from "#src/models/AudioPlayer";
import type { ViewerCaption } from "#src/models/ViewerCaption";

import { createFakeViewerLink } from "#src/services/createFakeViewerLink.test";
import { createReadingPlayer } from "#src/services/createReadingPlayer";
import { createViewerPlayer } from "#src/services/createViewerPlayer";
import { describe, expect, test, vi } from "vitest";

describe(createReadingPlayer, () => {
  const MODEL_ID = 2;
  const CAPTION: ViewerCaption = { color: 0, durationMs: 0, text: "A line" };
  const AUDIO = new Uint8Array([1, 2]);
  const createStockPlayer = () => {
    const stock = {
      close: vi.fn<AudioPlayer["close"]>(async () => {}),
      play: vi.fn<AudioPlayer["play"]>(async () => ""),
    } satisfies AudioPlayer;
    return { createStock: vi.fn(() => stock), stock };
  };

  test("No viewer listening falls back to the stock player", async () => {
    expect.hasAssertions();

    const { createStock, stock } = createStockPlayer();
    const { link } = createFakeViewerLink(false);
    const player = createReadingPlayer(createViewerPlayer(link, MODEL_ID), createStock);
    await expect(player.play(AUDIO, CAPTION)).resolves.toBe("");

    expect(link.bubble).not.toHaveBeenCalled();
    expect(stock.play).toHaveBeenCalledExactlyOnceWith(AUDIO);
  });

  test("A viewer dropping mid-reply moves the rest to the player", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0 });
    const { createStock, stock } = createStockPlayer();
    const { drop, link } = createFakeViewerLink();
    const player = createReadingPlayer(createViewerPlayer(link, MODEL_ID), createStock);
    const playing = player.play(AUDIO, CAPTION);
    await vi.runAllTimersAsync();
    await playing;
    drop();
    await player.play(AUDIO, CAPTION);
    vi.useRealTimers();

    expect(link.bubble).toHaveBeenCalledOnce();
    expect(createStock).toHaveBeenCalledOnce();
    expect(stock.play).toHaveBeenCalledExactlyOnceWith(AUDIO);
  });
});
