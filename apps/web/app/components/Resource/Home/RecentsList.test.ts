// @vitest-environment nuxt
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import ResourceHomeList from "#src/components/Resource/Home/List.vue";
import ResourceHomeRecentsList from "#src/components/Resource/Home/RecentsList.vue";
import { CacheTag } from "#src/models/cache/CacheTag";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useCacheStore } from "#src/store/cache";
import { useRecentStore } from "#src/store/resource/recent";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("resourceHomeRecentsList", () => {
  const { trpcMsw } = setupMswTrpc();

  // The store outlives the tab, so a remount re-reading an invalidated list already has the last read's rows —
  // A skeleton over them hides what the reader was just looking at for the length of a round trip
  test("keeps the rows it already has on screen while a read is out", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    const recent = createResourceListItem();
    let isFirstRead = true;
    trpcMsw.resource.readResources.query(async () => {
      // The first read lands at once, so the list holds its rows; the read a remount issues after the invalidation
      // Waits
      if (!isFirstRead) await readGate;
      isFirstRead = false;
      return { items: [{ ...recent, favorite: null }], nextCursor: "" };
    });
    const recentStore = useRecentStore();
    const { readRecents } = recentStore;
    await readRecents();
    const cacheStore = useCacheStore();
    const { invalidateTags } = cacheStore;
    await invalidateTags([CacheTag.Recents]);
    const wrapper = await mountSuspended(ResourceHomeRecentsList, { shallow: true });
    await flushPromises();

    const list = wrapper.findComponent(ResourceHomeList);

    expect(list.props("resources")).toStrictEqual([recent]);
    expect(list.props("isPending")).toBe(false);

    releaseRead();
    await flushPromises();
  });
});
