import type { Timer } from "@azure/functions";

import { purgeDeletedResourcesHandler } from "#src/handlers/purgeDeletedResourcesHandler";
import { purgeExpiredResources } from "#src/services/resource/purgeExpiredResources";
import { InvocationContext } from "@azure/functions";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/resource/purgeExpiredResources"), () => ({
  purgeExpiredResources: vi.fn<typeof purgeExpiredResources>(),
}));

describe(purgeDeletedResourcesHandler, () => {
  const context = new InvocationContext({ logHandler: () => {} });
  const timer = {} as Timer;

  afterEach(() => {
    vi.mocked(purgeExpiredResources).mockReset();
  });

  test("runs the purge once and rethrows nothing on a clean run", async () => {
    expect.hasAssertions();

    await purgeDeletedResourcesHandler(timer, context);

    expect(purgeExpiredResources).toHaveBeenCalledExactlyOnceWith(context);
  });

  test("rethrows a failed purge so the timer run is recorded as failed", async () => {
    expect.hasAssertions();

    vi.mocked(purgeExpiredResources).mockRejectedValueOnce(new Error("purge failed"));

    await expect(purgeDeletedResourcesHandler(timer, context)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: purge failed]`,
    );
  });
});
