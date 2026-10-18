import type { ViewerConfiguration } from "#src/models/ViewerConfiguration";
import type { ViewerLink } from "#src/models/ViewerLink";

import { VIEWER_DEFAULT_MODEL_ID } from "#src/services/constants";
import { createFakeViewerLink } from "#src/services/createFakeViewerLink.test";
import { setViewer } from "#src/services/setViewer";
import { describe, expect, test, vi } from "vitest";

describe(setViewer, () => {
  const ADDRESS = "ws://127.0.0.1:10086";
  const PROOF = "The viewer is set up.";
  const createDependencies = (link: ViewerLink | undefined) => ({
    connect: vi.fn<(address: string) => Promise<ViewerLink | undefined>>(async () => link),
    proofText: PROOF,
    readConfiguration: (): ViewerConfiguration | undefined => undefined,
    writeConfiguration: vi.fn<(configuration: ViewerConfiguration) => void>(),
  });

  test("The viewer verb proves the connection with one bubble", async () => {
    expect.hasAssertions();

    const { link } = createFakeViewerLink();
    const dependencies = createDependencies(link);
    await expect(setViewer(ADDRESS, VIEWER_DEFAULT_MODEL_ID, dependencies)).resolves.toBe(true);

    expect(link.bubble).toHaveBeenCalledExactlyOnceWith(
      VIEWER_DEFAULT_MODEL_ID,
      PROOF,
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
    );
    expect(dependencies.writeConfiguration).toHaveBeenCalledExactlyOnceWith({
      address: ADDRESS,
      modelId: VIEWER_DEFAULT_MODEL_ID,
      motions: {},
    });
    expect(link.close).toHaveBeenCalledOnce();
  });

  test("The viewer verb reports a viewer that did not answer", async () => {
    expect.hasAssertions();

    const dependencies = createDependencies(undefined);
    await expect(setViewer(ADDRESS, VIEWER_DEFAULT_MODEL_ID, dependencies)).resolves.toBe(false);

    expect(dependencies.writeConfiguration).not.toHaveBeenCalled();
  });
});
