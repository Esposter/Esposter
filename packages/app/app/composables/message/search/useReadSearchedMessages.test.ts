// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";
import type { MockInstance } from "vitest";
import type { Router } from "vue-router";

import { useReadSearchedMessages } from "@/composables/message/search/useReadSearchedMessages";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useSearchMessageStore } from "@/store/message/search";
import { useSearchHistoryStore } from "@/store/message/search/history";
import { noop } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(useReadSearchedMessages, () => {
  const server = setupMswTrpc();
  let wrapper: VueWrapper;
  let router: Router;
  let count: Ref<number>;
  let hasFiles: Ref<boolean>;
  let page: Ref<number>;
  let createSearchHistory: MockInstance<ReturnType<typeof useSearchHistoryStore>["createSearchHistory"]>;
  let readSearchedMessages: ReturnType<typeof useReadSearchedMessages>;
  const roomId = crypto.randomUUID();
  const newCount = 3;
  const filesPage = 5;
  const searchPage = 2;

  const mountRead = async () => {
    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          router = useRouter();
          router.currentRoute.value.params.id = roomId;
          triggerRef(router.currentRoute);
          const searchMessageStore = useSearchMessageStore();
          ({ count, hasFiles, page } = storeToRefs(searchMessageStore));
          // Each tab's page starts at its own value, so a page written into the wrong slice is visible
          hasFiles.value = true;
          page.value = filesPage;
          hasFiles.value = false;
          page.value = searchPage;
          const searchHistoryStore = useSearchHistoryStore();
          createSearchHistory = vi.spyOn(searchHistoryStore, "createSearchHistory").mockResolvedValue();
          readSearchedMessages = useReadSearchedMessages();
        },
      }),
    );
  };

  afterEach(() => {
    wrapper?.unmount();
    vi.restoreAllMocks();
  });

  // Each tab owns its own result slice, and the totals, the page and the history entry a search writes back are
  // As much a part of that slice as the rows — flipping to Files mid-flight must not hand the attachment browse
  // The text search's total, nor drop the history entry the text search earned
  test("files a search's totals, page and history under the tab it was issued for", async () => {
    expect.hasAssertions();

    let releaseSearch = noop;
    const searchGate = new Promise<void>((resolve) => {
      releaseSearch = resolve;
    });
    server.use(
      trpcMsw.message.searchMessages.query(async () => {
        await searchGate;
        return { count: newCount, data: { hasMore: false, items: [] } };
      }),
    );
    await mountRead();
    const pendingSearch = readSearchedMessages();
    // The search is issued a microtask after the call, so let it go out before the tab moves
    await flushPromises();
    // The user opens "Files in this room" before the text search comes back
    hasFiles.value = true;
    releaseSearch();
    await pendingSearch;

    expect(count.value).toBe(0);
    expect(page.value).toBe(filesPage);

    hasFiles.value = false;

    expect(count.value).toBe(newCount);
    expect(page.value).toBe(1);
    expect(createSearchHistory).toHaveBeenCalledTimes(1);
  });
});
