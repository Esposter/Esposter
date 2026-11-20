// @vitest-environment nuxt
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { usePurgeResource } from "#src/composables/resource/recycleBin/usePurgeResource";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

describe(usePurgeResource, () => {
  const { trpcMsw } = setupMswTrpc();

  // The bin's page is a plain read, so the row it shows stays until the purge is answered, and the re-read that follows
  // The answer is what takes it away
  test("re-reads the bin only once the purge is answered", async () => {
    expect.hasAssertions();

    const resource = createResourceListItem();
    const { promise: isReleased, resolve: releasePurge } = Promise.withResolvers<void>();
    trpcMsw.resource.purgeResource.mutation(async () => {
      await isReleased;
      return resource;
    });
    const refresh = vi.fn<() => Promise<void>>(() => Promise.resolve());
    usePurgeResource(refresh)(resource);
    await flushPromises();
    const refreshCallsInFlight = refresh.mock.calls.length;
    releasePurge();
    await waitForSynchronizedFunctions();

    expect(refreshCallsInFlight).toBe(0);
    expect(refresh).toHaveBeenCalledExactlyOnceWith();
  });
});
