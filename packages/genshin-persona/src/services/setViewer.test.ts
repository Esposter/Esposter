import type { ViewerConfiguration } from "#src/models/ViewerConfiguration";
import type { ViewerLink } from "#src/models/ViewerLink";

import {
  VIEWER_DEFAULT_FRAME_COLOR,
  VIEWER_DEFAULT_MODEL_ID,
  VIEWER_PROOF_DURATION_MS,
  VIEWER_TEXT_COLOR,
} from "#src/services/constants";
import { createFakeViewerLink } from "#src/services/createFakeViewerLink.test";
import { setViewer } from "#src/services/setViewer";
import { describe, expect, test, vi } from "vitest";

describe(setViewer, () => {
  const ADDRESS = "ws://127.0.0.1:10086";
  const PROOF = "The viewer is set up.";
  const createDependencies = (link: undefined | ViewerLink) => ({
    connect: vi.fn<(address: string) => Promise<undefined | ViewerLink>>(() => Promise.resolve(link)),
    proofText: PROOF,
    readConfiguration: (): undefined | ViewerConfiguration => undefined,
    writeConfiguration: vi.fn<(configuration: ViewerConfiguration) => void>(),
  });

  test("the viewer verb proves the connection with one bubble", async () => {
    expect.hasAssertions();

    const { link } = createFakeViewerLink();
    const dependencies = createDependencies(link);
    await expect(setViewer(ADDRESS, VIEWER_DEFAULT_MODEL_ID, dependencies)).resolves.toBe(true);

    expect(link.bubble).toHaveBeenCalledExactlyOnceWith(
      VIEWER_DEFAULT_MODEL_ID,
      PROOF,
      VIEWER_PROOF_DURATION_MS,
      VIEWER_DEFAULT_FRAME_COLOR,
      VIEWER_TEXT_COLOR,
    );
    expect(dependencies.writeConfiguration).toHaveBeenCalledExactlyOnceWith({
      address: ADDRESS,
      modelId: VIEWER_DEFAULT_MODEL_ID,
      motions: {},
    });
    expect(link.close).toHaveBeenCalledTimes(1);
  });

  test("the viewer verb reports a viewer that did not answer", async () => {
    expect.hasAssertions();

    const dependencies = createDependencies(undefined);
    await expect(setViewer(ADDRESS, VIEWER_DEFAULT_MODEL_ID, dependencies)).resolves.toBe(false);

    expect(dependencies.writeConfiguration).not.toHaveBeenCalled();
  });
});
