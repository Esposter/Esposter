// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useCursorPaginationOperationData, () => {
  let wrapper: VueWrapper;
  let readMoreItems: ReturnType<typeof useCursorPaginationOperationData<string>>["readMoreItems"];
  const goOffline = () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    window.dispatchEvent(new Event("offline"));
  };
  const goOnline = () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    window.dispatchEvent(new Event("online"));
  };

  beforeEach(() => {
    goOnline();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.restoreAllMocks();
  });

  test("does not query more items while offline and still completes the waypoint cycle", async () => {
    expect.hasAssertions();

    goOffline();
    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          const cursorPaginationData = ref(new CursorPaginationData<string>());
          cursorPaginationData.value.hasMore = true;
          cursorPaginationData.value.nextCursor = "cursor";
          ({ readMoreItems } = useCursorPaginationOperationData(cursorPaginationData));
        },
      }),
    );
    await flushPromises();

    const query = vi.fn<(cursor?: string) => Promise<CursorPaginationData<string>>>();
    const onComplete = vi.fn<() => void>();

    await readMoreItems(query, onComplete);

    expect(query).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
