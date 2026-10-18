import type { ViewerCaption } from "#src/models/ViewerCaption";
import type { ViewerLink } from "#src/models/ViewerLink";

import { VIEWER_BUBBLE_BEAT_MS, VIEWER_CLEAR_DURATION_MS, VIEWER_TEXT_COLOR } from "#src/services/constants";
import { createFakeViewerLink } from "#src/services/createFakeViewerLink.test";
import { createViewerPlayer } from "#src/services/createViewerPlayer";
import { existsSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { MockInstance } from "vitest";

const getPlayedPaths = (playSound: MockInstance<ViewerLink["playSound"]>) =>
  playSound.mock.calls.map(([, path]) => path);
// Settles a play on the test's clock, so the test can tell whether it has settled yet
const track = async (playing: Promise<string>, onSettle: () => void) => {
  await playing;
  onSettle();
};

describe(createViewerPlayer, () => {
  const MODEL_ID = 2;
  const COLOR = 0x12_34_56;
  const TEXT = "A line";
  const DURATION_MS = 1000;
  const CAPTION: ViewerCaption = { color: COLOR, durationMs: DURATION_MS, text: TEXT };
  const AUDIO = new Uint8Array([1, 2]);

  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test("A spoken line appears on the model", async () => {
    expect.hasAssertions();

    const { link } = createFakeViewerLink();
    const player = createViewerPlayer(link, MODEL_ID);
    const playing = player.play(AUDIO, CAPTION);
    await vi.runAllTimersAsync();

    expect(link.bubble).toHaveBeenCalledExactlyOnceWith(
      MODEL_ID,
      TEXT,
      DURATION_MS + VIEWER_BUBBLE_BEAT_MS,
      COLOR,
      VIEWER_TEXT_COLOR,
    );
    expect(link.playSound).toHaveBeenCalledExactlyOnceWith(MODEL_ID, expect.any(String));
    await expect(playing).resolves.toBe("");
  });

  test("The next line waits for the clip's own length", async () => {
    expect.hasAssertions();

    const { link } = createFakeViewerLink();
    const player = createViewerPlayer(link, MODEL_ID);
    let isFirstSettled = false;
    void track(player.play(AUDIO, CAPTION), () => {
      isFirstSettled = true;
    });
    await vi.advanceTimersByTimeAsync(DURATION_MS - 1);
    expect(isFirstSettled).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    expect(isFirstSettled).toBe(true);
  });

  test("A newer turn clears the bubble", async () => {
    expect.hasAssertions();

    const { link } = createFakeViewerLink();
    const player = createViewerPlayer(link, MODEL_ID);
    const playing = player.play(AUDIO, CAPTION);
    player.stop();

    await expect(playing).resolves.toBe("");
    expect(link.soundStop).toHaveBeenCalledExactlyOnceWith(MODEL_ID);
    expect(link.bubble).toHaveBeenLastCalledWith(MODEL_ID, "", VIEWER_CLEAR_DURATION_MS, COLOR, VIEWER_TEXT_COLOR);
  });

  test("A tap replays the last line", async () => {
    expect.hasAssertions();

    const { fireTap, link } = createFakeViewerLink();
    const player = createViewerPlayer(link, MODEL_ID);
    const playing = player.play(AUDIO, CAPTION);
    await vi.runAllTimersAsync();
    await playing;
    fireTap();

    expect(link.bubble).toHaveBeenCalledTimes(2);
    expect(link.bubble).toHaveBeenLastCalledWith(
      MODEL_ID,
      TEXT,
      DURATION_MS + VIEWER_BUBBLE_BEAT_MS,
      COLOR,
      VIEWER_TEXT_COLOR,
    );
    expect(link.playSound).toHaveBeenCalledTimes(2);
    expect(link.playSound).toHaveBeenLastCalledWith(MODEL_ID, getPlayedPaths(link.playSound)[0]);
  });

  test("A tap sends no turn to the session", async () => {
    expect.hasAssertions();

    const { fireTap, link } = createFakeViewerLink();
    const player = createViewerPlayer(link, MODEL_ID);
    const playing = player.play(AUDIO, CAPTION);
    await vi.runAllTimersAsync();
    await playing;
    fireTap();

    expect(link.motion).not.toHaveBeenCalled();
    expect(link.expressionClear).not.toHaveBeenCalled();
    expect(link.close).not.toHaveBeenCalled();
  });

  test("keeps only the last clip on disk, and removes it when disposed", async () => {
    expect.hasAssertions();

    const { link } = createFakeViewerLink();
    const player = createViewerPlayer(link, MODEL_ID);
    const first = player.play(AUDIO, CAPTION);
    await vi.runAllTimersAsync();
    await first;
    const second = player.play(AUDIO, CAPTION);
    await vi.runAllTimersAsync();
    await second;

    expect(getPlayedPaths(link.playSound).map((path) => existsSync(path))).toStrictEqual([false, true]);

    player.dispose();
    expect(getPlayedPaths(link.playSound).map((path) => existsSync(path))).toStrictEqual([false, false]);
    expect(link.close).toHaveBeenCalledExactlyOnceWith();
  });
});
