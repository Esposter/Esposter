import type { ViewerConfiguration } from "#src/models/ViewerConfiguration";
import type { ViewerLink } from "#src/models/ViewerLink";
import type { ViewerPlayer } from "#src/services/createViewerPlayer";

import { createFakeViewerLink } from "#src/services/createFakeViewerLink.test";
import { createViewerOpener } from "#src/services/createViewerOpener";
import { createViewerPlayer } from "#src/services/createViewerPlayer";
import { describe, expect, test, vi } from "vitest";

describe(createViewerOpener, () => {
  const ADDRESS = "ws://127.0.0.1:10086";
  const MODEL_ID = 0;
  const OTHER_MODEL_ID = 1;

  test("A machine with no viewer is unchanged", async () => {
    expect.hasAssertions();

    const connect = vi.fn<(address: string) => Promise<ViewerLink | undefined>>();
    const createPlayer = vi.fn();
    const opener = createViewerOpener({
      connect,
      createPlayer,
      readConfiguration: (): ViewerConfiguration | undefined => undefined,
    });

    await expect(opener.open()).resolves.toBeUndefined();
    expect(connect).not.toHaveBeenCalled();
    expect(createPlayer).not.toHaveBeenCalled();
  });

  test("A second open of the same viewer reuses its link", async () => {
    expect.hasAssertions();

    const { link } = createFakeViewerLink();
    const connect = vi.fn<(address: string) => Promise<ViewerLink | undefined>>().mockResolvedValue(link);
    const createPlayer = vi.fn<(link: ViewerLink, modelId: number) => ViewerPlayer>(createViewerPlayer);
    const configuration: ViewerConfiguration = { address: ADDRESS, modelId: MODEL_ID, motions: {} };
    const opener = createViewerOpener({ connect, createPlayer, readConfiguration: () => configuration });
    const player = await opener.open();

    await expect(opener.open()).resolves.toBe(player);
    expect(connect).toHaveBeenCalledExactlyOnceWith(ADDRESS);
    expect(createPlayer).toHaveBeenCalledExactlyOnceWith(link, MODEL_ID);
  });

  test("A second open with a different modelId builds a new player for that model", async () => {
    expect.hasAssertions();

    const first = createFakeViewerLink();
    const second = createFakeViewerLink();
    const connect = vi
      .fn<(address: string) => Promise<ViewerLink | undefined>>()
      .mockResolvedValueOnce(first.link)
      .mockResolvedValueOnce(second.link);
    const createPlayer = vi.fn<(link: ViewerLink, modelId: number) => ViewerPlayer>(createViewerPlayer);
    let configuration: ViewerConfiguration = { address: ADDRESS, modelId: MODEL_ID, motions: {} };
    const opener = createViewerOpener({ connect, createPlayer, readConfiguration: () => configuration });
    await opener.open();

    configuration = { address: ADDRESS, modelId: OTHER_MODEL_ID, motions: {} };
    await opener.open();

    expect(connect).toHaveBeenCalledTimes(2);
    expect(first.link.close).toHaveBeenCalledExactlyOnceWith();
    expect(createPlayer).toHaveBeenLastCalledWith(second.link, OTHER_MODEL_ID);
  });
});
