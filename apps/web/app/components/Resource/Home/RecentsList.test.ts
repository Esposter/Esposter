// @vitest-environment nuxt
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import ResourceHomeList from "#src/components/Resource/Home/List.vue";
import ResourceHomeRecentsList from "#src/components/Resource/Home/RecentsList.vue";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
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
    trpcMsw.resource.readResources.query(async () => {
      await readGate;
      return { items: [recent], nextCursor: "" };
    });
    const recentStore = useRecentStore();
    const { recents } = storeToRefs(recentStore);
    recents.value = [recent];
    const wrapper = await mountSuspended(ResourceHomeRecentsList, { shallow: true });
    await flushPromises();

    expect(wrapper.findComponent(ResourceHomeList).props("isPending")).toBe(false);

    releaseRead();
    await flushPromises();
  });
});
