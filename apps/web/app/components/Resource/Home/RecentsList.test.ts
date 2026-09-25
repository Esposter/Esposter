// @vitest-environment nuxt
import ResourceHomeList from "@/components/Resource/Home/List.vue";
import ResourceHomeRecentsList from "@/components/Resource/Home/RecentsList.vue";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useRecentStore } from "@/store/resource/recent";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("resourceHomeRecentsList", () => {
  const server = setupMswTrpc();

  // The store outlives the tab, so a remount re-reading an invalidated list already has the last read's rows —
  // A skeleton over them hides what the reader was just looking at for the length of a round trip
  test("keeps the rows it already has on screen while a read is out", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    const recent = createResourceListItem();
    server.use(
      trpcMsw.resource.readResources.query(async () => {
        await readGate;
        return { hasMore: false, items: [recent] };
      }),
    );
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
