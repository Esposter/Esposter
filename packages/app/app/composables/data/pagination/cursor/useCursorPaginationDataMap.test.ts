// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { createPendingQuery } from "@/composables/data/pagination/createPendingQuery.test";
import { goOnline } from "@/composables/shared/network.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useCursorPaginationDataMap, () => {
  const key = "key";
  const otherKey = "otherKey";
  const item = "item";
  let wrapper: VueWrapper;
  let currentId: Ref<string>;
  let items: ReturnType<typeof useCursorPaginationDataMap<string>>["items"];
  let readItems: ReturnType<typeof useCursorPaginationOperationData<string>>["readItems"];
  let readMoreItems: ReturnType<typeof useCursorPaginationOperationData<string>>["readMoreItems"];

  const mountDataMap = async () => {
    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          currentId = ref(key);
          ({ items, readItems, readMoreItems } = useCursorPaginationDataMap<string>(currentId));
        },
      }),
    );
    await flushPromises();
  };
  const createPendingRead = () => {
    const data = new CursorPaginationData<string>();
    data.items = [item];
    return createPendingQuery(data);
  };

  beforeEach(() => {
    goOnline();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.restoreAllMocks();
  });

  test("files a slow read under the key it was issued for, not the key that is current when it lands", async () => {
    expect.hasAssertions();

    await mountDataMap();
    const { query, resolveQuery } = createPendingRead();
    const pendingRead = readItems(query);
    // The target switches while the read for the original key is still in flight
    currentId.value = otherKey;
    await flushPromises();
    resolveQuery();
    await pendingRead;

    expect(items.value).toStrictEqual([]);

    currentId.value = key;
    await flushPromises();

    expect(items.value).toStrictEqual([item]);
  });

  test("appends a slow page to the key it was issued for", async () => {
    expect.hasAssertions();

    await mountDataMap();
    const { query, resolveQuery } = createPendingRead();
    const pendingRead = readMoreItems(query);
    currentId.value = otherKey;
    await flushPromises();
    resolveQuery();
    await pendingRead;

    expect(items.value).toStrictEqual([]);

    currentId.value = key;
    await flushPromises();

    expect(items.value).toStrictEqual([item]);
  });
});
