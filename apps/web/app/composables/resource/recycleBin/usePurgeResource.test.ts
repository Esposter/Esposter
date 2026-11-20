// @vitest-environment nuxt
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

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
  test("keeps the bin's row while the purge is in flight", async () => {
    expect.hasAssertions();

    const resource = createResourceListItem();
    const items = ref<ResourceListItem[]>([resource]);
    const { promise: isReleased, resolve: releasePurge } = Promise.withResolvers<void>();
    trpcMsw.resource.purgeResource.mutation(async () => {
      await isReleased;
      return resource;
    });
    const refresh = vi.fn<() => Promise<void>>(() => Promise.resolve());
    usePurgeResource(items, refresh)(resource);
    await flushPromises();
    const rowsInFlight = [...items.value];
    releasePurge();
    await waitForSynchronizedFunctions();

    expect(rowsInFlight).toStrictEqual([resource]);
    expect(refresh).toHaveBeenCalledExactlyOnceWith();
  });
});
