import type { ViewerConfiguration } from "#src/models/ViewerConfiguration";
import type { ViewerLink } from "#src/models/ViewerLink";

import { createViewerOpener } from "#src/services/createViewerOpener";
import { describe, expect, test, vi } from "vitest";

describe(createViewerOpener, () => {
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
});
